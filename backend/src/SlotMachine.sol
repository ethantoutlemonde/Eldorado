// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

// contract SlotMachine is VRFConsumerBase {
//     uint256 private fee;
//     bytes32 private keyHash;
//     mapping(bytes32 => address) private requests;
    
//     event SpinResult(address indexed player, uint8[3] symbols, uint256 payout);
    
//     constructor(
//         address vrfCoordinator,
//         address linkToken,
//         bytes32 _keyHash,
//         uint256 _fee
//     ) VRFConsumerBase(vrfCoordinator, linkToken) {
//         keyHash = _keyHash;
//         fee = _fee;
//     }

//     function spin() public payable {
//         require(msg.value >= 0.01 ether, "Mise insuffisante");
//         require(LINK.balanceOf(address(this)) >= fee, "Fonds LINK insuffisants");
//         bytes32 requestId = requestRandomness(keyHash, fee);
//         requests[requestId] = msg.sender;
//     }

//     function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
//         address player = requests[requestId];
//         uint8[3] memory symbols = [uint8(randomness % 5), uint8((randomness / 10) % 5), uint8((randomness / 100) % 5)];
//         uint256 payout = calculatePayout(symbols);
//         if (payout > 0) {
//             payable(player).transfer(payout);
//         }
//         emit SpinResult(player, symbols, payout);
//     }

//     function calculatePayout(uint8[3] memory symbols) private pure returns (uint256) {
//         if (symbols[0] == symbols[1] && symbols[1] == symbols[2]) {
//             if (symbols[0] == 0) return 100 ether;
//             if (symbols[0] == 1) return 50 ether;
//             if (symbols[0] == 2) return 20 ether;
//         }
//         return 0;
//     }
// }