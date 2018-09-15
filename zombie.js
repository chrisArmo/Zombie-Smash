/**
 * Zombie Game
 */

// Dependencies
// ==================================================

const inquirer = require("inquirer"),
fs = require("fs"),
readline = require("readline");

// Global Variables
// ==================================================

// Argument for reset check
const [nodePath, filePath, resetArgument] = process.argv,
// Game tracker
gameTracker = {
    player: 70,
    zombie: 20,
    over: false,
    score: {},
    locations: [
        "head", "chest", "legs", "arms"
    ],
    damage: {
        head: 10,
        chest: 6,
        legs: 4,
        arms: 3
    }
};


// Functions
// ==================================================

// Get random number
const getRandomNumber = (max = 4) => Math.floor((Math.random() * max));

// Check game reset
const checkReset = (reset) => {
    const resetPattern = /^(reset|r)$/;
    return resetPattern.test(reset);
};

// Clear console
const clearConsole = () => {
    console.log("\n".repeat(process.stdout.rows));
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
};

// Play game
const playGame = (game) => {
    inquirer.prompt([
        {
            type: "list",
            name: "target",
            message: "Try to stay alive! \nSwing your bat at what part of the zombie?",
            choices: ["head", "chest", "legs", "arms"]
        }
    ]).then((actions) => {
        if (!game.over) {
            fs.readFile("scoreboard.json", "utf8", (err, data) => {
                if (!err) {
                    const zombieVulnerability = game.locations[getRandomNumber(game.locations.length)], 
                    damage = game.damage[actions.target],
                    score = JSON.parse(data);

                    clearConsole();

                    game.score.player = parseInt(score.player, 10);
                    game.score.zombie = parseInt(score.zombie, 10);

                    console.log(`Scoreboard: Player ${score.player} | Zombie ${score.zombie}`);
        
                    if (actions.target === zombieVulnerability) {
                        game.zombie -= damage;
                        console.log(`\nDirect hit with the zombie's ${actions.target}`);
                        console.log(`You dealt ${damage} damage to the zombie.`);
                    } else {
                        game.player -= damage;
                        console.log(`\nYou missed the zombie's ${actions.target}`);
                        console.log(`The Zombie dealt ${damage} damage to you.`);
                    }
        
                    if (game.player > 0 && game.zombie > 0) {
                        console.log(
                            `\nYou have ${game.player} health remaining` +
                            `\nThe zombie has ${game.zombie} health remaining\n`
                        );
                    }
                    
                    checkGame(game);
                }
            });
        }
    });
};

// Check game
const checkGame = (game) => {
    if (game.player <= 0) {
        game.score.zombie += 1;
        game.over = true;
        console.log("\nBummer, the zombie devoured your brain :(");
    } else if (game.zombie <= 0) {
        game.score.player += 1;
        game.over = true;
        console.log("\nYou smashed the zombie into a bloody mess!");
    }

    if (!game.over) {
        playGame(game);
    } else {
        fs.writeFile(
            "scoreboard.json", 
            JSON.stringify({
                player: game.score.player,
                zombie: game.score.zombie
            }), 
            (err) => {
                if (!err) {
                    console.log(`\nEnd Game Scoreboard: Player ${game.score.player} | Zombie ${game.score.zombie}`);
                }
            }
        );
    }
};

// Main
// ==================================================

if (checkReset(resetArgument)) {
    fs.writeFile(
        "scoreboard.json",
        JSON.stringify({
            player: 0,
            zombie: 0
        }),
        (err) => {
            if (!err) {
                clearConsole();
                playGame(gameTracker);
            }
        }
    );
} else {
    clearConsole();
    playGame(gameTracker);
}
