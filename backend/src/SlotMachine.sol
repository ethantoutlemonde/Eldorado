// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SlotMachine is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 300000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 3;

    address public owner;
    IERC20 public immutable token;    // Token Eldorado

    uint256 public constant SYMBOL_COUNT = 16;
    mapping(uint256 => uint256) public symbolMultipliers;

    mapping(uint256 => address) public requestToPlayer;
    mapping(address => uint256) public playerBalances;
    mapping(uint256 => uint256) public requestToBetAmount;

    uint256 public minBetAmount = 1 * 10 ** 18; // 1 ELD minimum

    event SpinRequested(address indexed player, uint256 requestId, uint256 betAmount);
    event SpinResult(address indexed player, uint256[3] reels, uint256 winAmount);

    constructor(
        address _token,
        uint64 _subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        owner = msg.sender;
        token = IERC20(_token);

        for (uint256 i = 0; i < SYMBOL_COUNT; i++) {
            symbolMultipliers[i] = (i + 1) * 2;
        }
    }

    function spin(uint256 betAmount) external returns (uint256 requestId) {
        require(betAmount >= minBetAmount, "Bet below minimum");
        require(token.transferFrom(msg.sender, address(this), betAmount), "Token transfer failed");

        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        requestToPlayer[requestId] = msg.sender;
        requestToBetAmount[requestId] = betAmount;

        emit SpinRequested(msg.sender, requestId, betAmount);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address player = requestToPlayer[requestId];
        require(player != address(0), "Invalid request");

        uint256 betAmount = requestToBetAmount[requestId];

        uint256[3] memory reels = [
            randomWords[0] % SYMBOL_COUNT,
            randomWords[1] % SYMBOL_COUNT,
            randomWords[2] % SYMBOL_COUNT
        ];

        uint256 winAmount = 0;

        if (reels[0] == reels[1] && reels[1] == reels[2]) {
            uint256 multiplier = symbolMultipliers[reels[0]];
            winAmount = betAmount * multiplier;

            if (token.balanceOf(address(this)) >= winAmount) {
                playerBalances[player] += winAmount;
            } else {
                winAmount = 0;
            }
        }

        emit SpinResult(player, reels, winAmount);
    }

    function withdraw() external {
        uint256 amount = playerBalances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        playerBalances[msg.sender] = 0;
        require(token.transfer(msg.sender, amount), "Token transfer failed");
    }

    function fund(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Funding transfer failed");
    }

    function withdrawBankroll(uint256 amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(token.transfer(owner, amount), "Withdraw failed");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
