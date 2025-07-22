// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Eldorado is VRFConsumerBase, ReentrancyGuard {
    address public owner;
    address public eldToken; // Token ELD fixe
    uint256 public fee;
    bytes32 public keyHash;
    mapping(address => uint256) public bets;
    mapping(address => uint256) public betAmounts; // Montant misé par joueur
    
    uint256 private lastRandomNumber;
    bool private hasRandomNumber = false;
    
    event BetPlaced(address indexed player, uint256 amount, uint256 betType);
    event SpinResult(uint256 winningNumber);
    event Payout(address indexed player, uint256 amount);
    
    constructor(address vrfCoordinator, address linkToken, address _eldToken, bytes32 _keyHash, uint256 _fee)
        VRFConsumerBase(vrfCoordinator, linkToken) {
        owner = msg.sender;
        eldToken = _eldToken;
        keyHash = _keyHash;
        fee = _fee;
    }

    function placeBet(uint256 betType, uint256 amount) external nonReentrant {
        require(amount > 0, "Mise insuffisante");
        
        // Transfert des tokens ELD du joueur vers le contrat
        IERC20(eldToken).transferFrom(msg.sender, address(this), amount);
        
        bets[msg.sender] = betType;
        betAmounts[msg.sender] = amount;
        emit BetPlaced(msg.sender, amount, betType);
    }

    function spinRoulette() external nonReentrant {
        require(LINK.balanceOf(address(this)) >= fee, "Fonds insuffisants");
        requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        lastRandomNumber = randomness % 37;
        hasRandomNumber = true;
        emit SpinResult(lastRandomNumber);
    }

    // Fonction qui renvoie le nombre aléatoire
    function getRandomNumber() external view returns (uint256) {
        require(hasRandomNumber, "Pas de nombre aleatoire");
        return lastRandomNumber;
    }

    // Fonction qui permet de récupérer si il y a victoire
    function checkVictory(address player) public view returns (bool) {
        if (!hasRandomNumber) return false;
        return bets[player] == lastRandomNumber;
    }

    function claimWinnings() external nonReentrant {
        uint256 betType = bets[msg.sender];
        uint256 betAmount = betAmounts[msg.sender];
        require(betType > 0, "Aucune mise trouvee");
        require(checkVictory(msg.sender), "Pas de victoire");
        
        bets[msg.sender] = 0;
        betAmounts[msg.sender] = 0;
        uint256 payout =  (betAmount * 15) / 10; // Payout simple

        IERC20(eldToken).transfer(msg.sender, payout);
        emit Payout(msg.sender, payout);
    }

    function withdrawFunds(uint256 amount) external {
        require(msg.sender == owner, "Seul le proprio");
        IERC20(eldToken).transfer(owner, amount);
    }

}