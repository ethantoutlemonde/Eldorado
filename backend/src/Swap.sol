// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint amountOutMin, address[] calldata path, address to, uint deadline
    ) external payable returns (uint[] memory amounts);

    function swapExactTokensForETH(
        uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline
    ) external returns (uint[] memory amounts);

    function swapExactTokensForTokens(
        uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

contract Swap is ReentrancyGuard, Ownable {
    using Address for address payable;

    IUniswapV2Router public immutable router;
    address public immutable ELD;
    address public immutable USDC;
    address public immutable USDT;
    address public immutable WETH;

    address public treasury;
    uint256 public feePercent = 100; // 1% in basis points (100 = 1%)

    constructor(
        address _router,
        address _ELD,
        address _USDC,
        address _USDT,
        address _WETH,
        address _treasury,
        address _initialOwner
    ) Ownable(_initialOwner) {
        router = IUniswapV2Router(_router);
        ELD = _ELD;
        USDC = _USDC;
        USDT = _USDT;
        WETH = _WETH;
        treasury = _treasury;
    }

    modifier supportedToken(address token) {
        require(token == ELD || token == USDC || token == USDT || token == WETH, "Unsupported token");
        _;
    }

    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Max 5%");
        feePercent = newFee;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function _applyFee(uint256 amount) internal view returns (uint256 net, uint256 fee) {
        fee = (amount * feePercent) / 10000;
        net = amount - fee;
    }

    function swapETHToELD(uint amountOutMin, uint deadline) external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");

        (uint256 amount, uint256 fee) = _applyFee(msg.value);

        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = ELD;

        if (fee > 0) {
            payable(treasury).sendValue(fee);
        }

        router.swapExactETHForTokens{ value: amount }(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }

    function swapTokenToELD(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant supportedToken(tokenIn) {
        require(tokenIn != ELD, "Use ELD to Token function");

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        (uint256 amount, uint256 fee) = _applyFee(amountIn);

        // IERC20(tokenIn).approve(address(router), amount);
        IERC20(tokenIn).approve(address(router), 0);       // reset pour compatibilité (ex: USDT)
        IERC20(tokenIn).approve(address(router), amount);  // autorisation réelle

        if (fee > 0) {
            IERC20(tokenIn).transfer(treasury, fee);
        }

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = ELD;

        router.swapExactTokensForTokens(
            amount,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }

    function swapELDToToken(
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant supportedToken(tokenOut) {
        require(tokenOut != ELD, "Cannot swap to same token");

        IERC20(ELD).transferFrom(msg.sender, address(this), amountIn);

        (uint256 amount, uint256 fee) = _applyFee(amountIn);

        // IERC20(ELD).approve(address(router), amount);
        IERC20(ELD).approve(address(router), 0);       // reset pour compatibilité (ex: USDT)
        IERC20(ELD).approve(address(router), amount);  // autorisation réelle

        if (fee > 0) {
            IERC20(ELD).transfer(treasury, fee);
        }

        address[] memory path = new address[](2);
        path[0] = ELD;
        path[1] = tokenOut;

        if (tokenOut == WETH) {
            router.swapExactTokensForETH(
                amount,
                amountOutMin,
                path,
                msg.sender,
                deadline
            );
        } else {
            router.swapExactTokensForTokens(
                amount,
                amountOutMin,
                path,
                msg.sender,
                deadline
            );
        }
    }

    receive() external payable {}
}