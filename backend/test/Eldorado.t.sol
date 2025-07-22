// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/Eldorado.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 Token
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// Mock VRF Coordinator
contract MockVRFCoordinator {
    address public LINK;
    uint256 public fee = 0.1 ether;
    
    constructor(address _linkToken) {
        LINK = _linkToken;
    }
    
    // Fonction appelée quand on fait requestRandomness
    function onTokenTransfer(address sender, uint256 amount, bytes calldata data) external {
        require(msg.sender == LINK, "Seul LINK autorise");
        require(amount >= fee, "Fee insuffisante");
        
        // Décoder les données pour obtenir keyHash et consumer
        (bytes32 keyHash, address consumer) = abi.decode(data, (bytes32, address));
        
        // Simuler une réponse immédiate avec une valeur "aléatoire"
        bytes32 requestId = keccak256(abi.encodePacked(keyHash, sender, block.timestamp));
        uint256 randomness = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, requestId))) + 777;
        
        // Callback immédiat
        VRFConsumerBase(consumer).rawFulfillRandomness(requestId, randomness);
    }
    
    // Fonction pour tester manuellement avec des valeurs spécifiques
    function fulfillRandomnessManual(address consumer, bytes32 requestId, uint256 randomness) external {
        VRFConsumerBase(consumer).rawFulfillRandomness(requestId, randomness);
    }
}

contract EldoradoTest is Test {
    Eldorado public eldorado;
    MockERC20 public eldToken;
    MockERC20 public linkToken;
    MockVRFCoordinator public vrfCoordinator;
    
    address public owner;
    address public player1;
    address public player2;
    
    bytes32 public constant KEY_HASH = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
    uint256 public constant VRF_FEE = 0.1 ether;
    
    function setUp() public {
        owner = address(this);
        player1 = address(0x1);
        player2 = address(0x2);
        
        // Déployer les tokens mock
        eldToken = new MockERC20("Eldorado Token", "ELD");
        linkToken = new MockERC20("ChainLink Token", "LINK");
        
        // Déployer le VRF Coordinator mock
        vrfCoordinator = new MockVRFCoordinator(address(linkToken));
        
        // Déployer le contrat Eldorado
        eldorado = new Eldorado(
            address(vrfCoordinator),
            address(linkToken),
            address(eldToken),
            KEY_HASH,
            VRF_FEE
        );
        
        // Distribuer des tokens aux joueurs
        eldToken.mint(player1, 1000 ether);
        eldToken.mint(player2, 1000 ether);
        
        // Alimenter le contrat en tokens ELD pour les gains
        eldToken.mint(address(eldorado), 10000 ether);
        
        // Alimenter le contrat en LINK
        linkToken.mint(address(eldorado), 10 ether);
        
        // Approuver le contrat pour les joueurs
        vm.prank(player1);
        eldToken.approve(address(eldorado), type(uint256).max);
        
        vm.prank(player2);
        eldToken.approve(address(eldorado), type(uint256).max);
    }
    
    function testDeployment() public {
        assertEq(eldorado.owner(), owner);
        assertEq(eldorado.eldToken(), address(eldToken));
        assertEq(eldorado.keyHash(), KEY_HASH);
        assertEq(eldorado.fee(), VRF_FEE);
    }
    
    function testPlaceBet() public {
        uint256 betAmount = 10 ether;
        uint256 betType = 7;
        
        uint256 initialPlayerBalance = eldToken.balanceOf(player1);
        uint256 initialContractBalance = eldToken.balanceOf(address(eldorado));
        
        vm.prank(player1);
        eldorado.placeBet(betType, betAmount);
        
        assertEq(eldorado.bets(player1), betType);
        assertEq(eldorado.betAmounts(player1), betAmount);
        assertEq(eldToken.balanceOf(player1), initialPlayerBalance - betAmount);
        assertEq(eldToken.balanceOf(address(eldorado)), initialContractBalance + betAmount);
    }
    
    function testPlaceBetZeroAmount() public {
        vm.prank(player1);
        vm.expectRevert("Mise insuffisante");
        eldorado.placeBet(7, 0);
    }
    
    function testSpinRoulette() public {
        // Placer une mise d'abord
        vm.prank(player1);
        eldorado.placeBet(7, 10 ether);
        
        // Lancer la roulette
        eldorado.spinRoulette();
        // Le test passe si pas de revert
        assertTrue(true);
    }
    
    function testSpinRouletteInsufficientLINK() public {
        // Créer un nouveau contrat sans LINK
        Eldorado eldoradoNoLink = new Eldorado(
            address(vrfCoordinator),
            address(linkToken),
            address(eldToken),
            KEY_HASH,
            VRF_FEE
        );
        
        vm.expectRevert("Fonds insuffisants");
        eldoradoNoLink.spinRoulette();
    }
    
    function testFulfillRandomness() public {
        // Placer une mise
        vm.prank(player1);
        eldorado.placeBet(7, 10 ether);
        
        // Lancer la roulette - maintenant le callback se fait automatiquement
        eldorado.spinRoulette();
        
        // Vérifier qu'un nombre aléatoire a été généré
        uint256 result = eldorado.getRandomNumber();
        assertTrue(result <= 36);
    }
    
    // Test de fuzzing pour vérifier que le modulo fonctionne correctement
    function testFuzzRandomnessModulo(uint256 randomInput) public {
        vm.assume(randomInput > 0);
        
        vm.prank(player1);
        eldorado.placeBet(7, 10 ether);
        
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, randomInput);
        
        uint256 result = eldorado.getRandomNumber();
        
        // Vérifier que le résultat est bien entre 0 et 36
        assertTrue(result <= 36);
        assertEq(result, randomInput % 37);
    }
    
    // Test pour vérifier que différentes valeurs donnent différents résultats
    function testDifferentRandomValues() public {
        uint256[] memory testValues = new uint256[](5);
        testValues[0] = 123;
        testValues[1] = 456789;
        testValues[2] = 999999;
        testValues[3] = 1;
        testValues[4] = type(uint256).max;
        
        for (uint i = 0; i < testValues.length; i++) {
            // Placer une nouvelle mise pour chaque test
            vm.prank(player1);
            eldToken.mint(player1, 1 ether); // Mint plus de tokens pour les tests multiples
            vm.prank(player1);
            eldorado.placeBet(7, 1 ether);
            
            bytes32 requestId = bytes32(uint256(i + 1));
            vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, testValues[i]);
            
            uint256 result = eldorado.getRandomNumber();
            assertEq(result, testValues[i] % 37);
            assertTrue(result <= 36);
            
            // Reset pour le prochain tour
            vm.prank(player1);
            if (eldorado.checkVictory(player1)) {
                eldorado.claimWinnings();
            }
        }
    }
    
    function testCheckVictoryWin() public {
        uint256 betType = 7;
        
        // Placer une mise
        vm.prank(player1);
        eldorado.placeBet(betType, 10 ether);
        
        // Pour garantir une victoire, on utilise la fonction manuelle
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, 7); // Force le résultat à 7
        
        assertTrue(eldorado.checkVictory(player1));
    }
    
    function testCheckVictoryLose() public {
        uint256 betType = 7;
        
        // Placer une mise
        vm.prank(player1);
        eldorado.placeBet(betType, 10 ether);
        
        // Pour garantir une défaite, forcer le résultat à 15
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, 15);
        
        assertFalse(eldorado.checkVictory(player1));
    }
    
    function testClaimWinnings() public {
        uint256 betType = 7;
        uint256 betAmount = 10 ether;
        uint256 expectedPayout = betAmount * 35;
        
        // Placer une mise
        vm.prank(player1);
        eldorado.placeBet(betType, betAmount);
        
        // Forcer une victoire
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, 7);
        
        uint256 initialBalance = eldToken.balanceOf(player1);
        
        // Récupérer les gains
        vm.prank(player1);
        eldorado.claimWinnings();
        
        assertEq(eldToken.balanceOf(player1), initialBalance + expectedPayout);
        assertEq(eldorado.bets(player1), 0);
        assertEq(eldorado.betAmounts(player1), 0);
    }
    
    function testClaimWinningsNoBet() public {
        vm.prank(player1);
        vm.expectRevert("Aucune mise trouvee");
        eldorado.claimWinnings();
    }
    
    function testClaimWinningsNoVictory() public {
        uint256 betType = 7;
        uint256 betAmount = 10 ether;
        
        // Placer une mise
        vm.prank(player1);
        eldorado.placeBet(betType, betAmount);
        
        // Forcer une défaite
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, 15);
        
        vm.prank(player1);
        vm.expectRevert("Pas de victoire");
        eldorado.claimWinnings();
    }
    
    function testMultiplePlayers() public {
        uint256 betAmount = 10 ether;
        
        // Joueur 1 mise sur 7
        vm.prank(player1);
        eldorado.placeBet(7, betAmount);
        
        // Joueur 2 mise sur 15
        vm.prank(player2);
        eldorado.placeBet(15, betAmount);
        
        assertEq(eldorado.bets(player1), 7);
        assertEq(eldorado.bets(player2), 15);
        assertEq(eldorado.betAmounts(player1), betAmount);
        assertEq(eldorado.betAmounts(player2), betAmount);
    }
    
    function testGetRandomNumberBeforeSpin() public {
        vm.expectRevert("Pas de nombre aleatoire");
        eldorado.getRandomNumber();
    }
    
    function testEventBetPlaced() public {
        uint256 betAmount = 10 ether;
        uint256 betType = 7;
        
        vm.expectEmit(true, false, false, true);
        emit BetPlaced(player1, betAmount, betType);
        
        vm.prank(player1);
        eldorado.placeBet(betType, betAmount);
    }
    
    function testEventSpinResult() public {
        // Placer une mise
        vm.prank(player1);
        eldorado.placeBet(7, 10 ether);
        
        uint256 randomValue = 777;
        uint256 expectedResult = randomValue % 37;
        
        vm.expectEmit(false, false, false, true);
        emit SpinResult(expectedResult);
        
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, randomValue);
    }
    
    function testEventPayout() public {
        uint256 betType = 7;
        uint256 betAmount = 10 ether;
        uint256 expectedPayout = betAmount * 35;
        
        // Setup pour victoire
        vm.prank(player1);
        eldorado.placeBet(betType, betAmount);
        
        bytes32 requestId = bytes32(uint256(1));
        vrfCoordinator.fulfillRandomnessManual(address(eldorado), requestId, 7);
        
        vm.expectEmit(true, false, false, true);
        emit Payout(player1, expectedPayout);
        
        vm.prank(player1);
        eldorado.claimWinnings();
    }
    
    // Events pour les tests
    event BetPlaced(address indexed player, uint256 amount, uint256 betType);
    event SpinResult(uint256 winningNumber);
    event Payout(address indexed player, uint256 amount);
}