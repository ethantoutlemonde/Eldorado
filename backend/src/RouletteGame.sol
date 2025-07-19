// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

// contract Roulette is VRFConsumerBase {
//     address public owner;
//     uint256 public fee;
//     bytes32 public keyHash;
//     mapping(address => uint256) public bets;
    
//     event BetPlaced(address indexed player, uint256 amount, uint256 betType);
//     event SpinResult(uint256 winningNumber);
//     event Payout(address indexed player, uint256 amount);
    
//     constructor(address vrfCoordinator, address linkToken, bytes32 _keyHash, uint256 _fee)
//         VRFConsumerBase(vrfCoordinator, linkToken) {
//         owner = msg.sender;
//         keyHash = _keyHash;
//         fee = _fee;
//     }

//     function placeBet(uint256 betType) external payable {
//         require(msg.value > 0, "Mise insuffisante");
//         bets[msg.sender] = betType;
//         emit BetPlaced(msg.sender, msg.value, betType);
//     }

//     function spinRoulette() external {
//         require(LINK.balanceOf(address(this)) >= fee, "Fonds insuffisants");
//         requestRandomness(keyHash, fee);
//     }

//     function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
//         uint256 winningNumber = randomness % 37;
//         emit SpinResult(winningNumber);
//     }
// }