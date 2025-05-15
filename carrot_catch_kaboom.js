// Initialize Kaboom context
kaboom({
    width: 600,
    height: 400,
    font: "sans-serif",
    // touchToMouse: false, // Optional: Set to false if you want to handle mouse and touch separately.
                           // Default is true, meaning touch events also simulate mouse events.
                           // For simple tap areas, the default is usually fine.
});

// --- Asset Loading ---
const bunnySpriteLayout = { sliceX: 3, sliceY: 2 };
loadSprite("bunny_original", "bunny_spritesheet.png", bunnySpriteLayout);
loadSprite("bunny_blue", "bunny_blue_spritesheet.png", bunnySpriteLayout);
loadSprite("bunny_green", "bunny_green_spritesheet.png", bunnySpriteLayout);
loadSprite("bunny_pink", "bunny_pink_spritesheet.png", bunnySpriteLayout);
loadSprite("bunny_yellow", "bunny_yellow_spritesheet.png", bunnySpriteLayout);

loadSprite("carrot", "img/carrot.png");
loadSprite("goblin", "img/goblin.png");
loadSprite("bg_back", "img/bg_back.png");
loadSprite("bg_front", "img/bg_front.png");
loadSprite("title_bg", "img/title_screen_bg.png");
loadSprite("game_over_bg", "img/game_over_bg.png");

loadSound("bg_music", "carrotcatchmusic.mp3");
loadSound("sfx_carrot_spawn", "sfx/carrot_spawn.mp3");
loadSound("sfx_goblin_steal_1", "sfx/goblin_steal_1.mp3");
loadSound("sfx_goblin_steal_2", "sfx/goblin_steal_2.mp3");
loadSound("sfx_goblin_steal_3", "sfx/goblin_steal_3.mp3");
loadSound("sfx_player_catch", "sfx/player_catch.mp3");
loadSound("sfx_speed_up", "sfx/speed_up_alert.mp3");
loadSound("sfx_first_death", "sfx/first_death.mp3");
loadSound("sfx_second_death", "sfx/second_death.mp3");
loadSound("sfx_final_death", "sfx/final_death.mp3");
loadSound("sfx_game_over", "sfx/game_over_sound.mp3");


// --- Game Variables ---
const PLAYER_SPEED = 320;
const BASE_CARROT_SPEED = 120;
let currentCarrotSpeed = BASE_CARROT_SPEED;
const BASE_GOBLIN_SPEED = 80;
let currentGoblinSpeed = BASE_GOBLIN_SPEED;
const GOBLIN_SPRINT_SPEED_MULTIPLIER = 4;
const CARROT_SPAWN_RATE = 1.2;
const GOBLIN_SPAWN_RATE = 3.5;
const BG_BACK_SPEED_EFFECTIVE = 20;
const BG_FRONT_SPEED_EFFECTIVE = 50;
let score = 0;
let lives = 3;
const MAX_LIVES = 3;
const FRAME_IDLE = 0;
const FRAME_MOVE_RIGHT = 3;
const FRAME_MOVE_LEFT = 4;
const FRAME_REACTION_SAD = 2;
const BUNNY_REACTION_TIME = 0.7;
let isBunnyReacting = false;
let carrotsCollectedForSpeedUp = 0;
const CARROTS_PER_SPEED_UP = 10;
const SPEED_INCREASE_FACTOR = 1.5;

const bunnyOptions = [
    { name: "Original", spriteKey: "bunny_original", colorText: "Classic Bun" },
    { name: "Blue", spriteKey: "bunny_blue", colorText: "Azure Hopster" },
    { name: "Green", spriteKey: "bunny_green", colorText: "Forest Green" },
    { name: "Pink", spriteKey: "bunny_pink", colorText: "Bubblegum Pink" },
    { name: "Yellow", spriteKey: "bunny_yellow", colorText: "Sunny Yellow" },
];
let selectedBunnyIndex = 0;
let chosenBunnySpriteKey = bunnyOptions[selectedBunnyIndex].spriteKey;
let playerUsername = "Player";

const HIGH_SCORE_KEY = "carrotCatchHighScores";
const MAX_HIGH_SCORES = 5;
let musicPlayer = null;

function getHighScores(){const s=localStorage.getItem(HIGH_SCORE_KEY);return s?JSON.parse(s):[]}
function addHighScore(n,s){const o=getHighScores();o.push({name:n,score:s}),o.sort((a,b)=>b.score-a.score);const t=o.slice(0,MAX_HIGH_SCORES);localStorage.setItem(HIGH_SCORE_KEY,JSON.stringify(t));return t}
function startMusic(){if(!musicPlayer||(musicPlayer&&musicPlayer.paused)){if(musicPlayer&&typeof musicPlayer.stop==="function"){musicPlayer.stop()}musicPlayer=play("bg_music",{loop:true,volume:0.5,})}}
function stopMusic(){if(musicPlayer&&typeof musicPlayer.stop==="function"){musicPlayer.stop()}}


// --- Game Scenes ---

scene("start", () => {
    add([sprite("title_bg"), pos(0,0), z(-1)]);
    const startInteractions=()=>{startMusic();go("charSelect");};
    onClick(startInteractions);onKeyPress("enter",startInteractions);
});

scene("charSelect", () => {
    startMusic();
    add([sprite("bg_back"),pos(0,0),z(-1)]);add([text("Choose Your Bunny!",{size:36,font:"arial"}),pos(width()/2,50),anchor("center")]);
    const bunnyDisplay=add([sprite(bunnyOptions[selectedBunnyIndex].spriteKey,{frame:FRAME_IDLE}),pos(width()/2,height()/2-40),scale(3),anchor("center")]);
    const bunnyNameText=add([text(bunnyOptions[selectedBunnyIndex].colorText,{size:24,font:"arial"}),pos(width()/2,height()/2+60),anchor("center")]);
    function updateBunnyDisplay(){bunnyDisplay.use(sprite(bunnyOptions[selectedBunnyIndex].spriteKey,{frame:FRAME_IDLE}));bunnyNameText.text=bunnyOptions[selectedBunnyIndex].colorText;chosenBunnySpriteKey=bunnyOptions[selectedBunnyIndex].spriteKey;}
    add([text("< Prev",{size:30,font:"arial"}),pos(width()*.25,height()/2-40),anchor("center"),area(),"prevBtn"]);onClick("prevBtn",()=>{selectedBunnyIndex--;if(selectedBunnyIndex<0)selectedBunnyIndex=bunnyOptions.length-1;updateBunnyDisplay();});onKeyPress("left",()=>{selectedBunnyIndex--;if(selectedBunnyIndex<0)selectedBunnyIndex=bunnyOptions.length-1;updateBunnyDisplay();});
    add([text("Next >",{size:30,font:"arial"}),pos(width()*.75,height()/2-40),anchor("center"),area(),"nextBtn"]);onClick("nextBtn",()=>{selectedBunnyIndex++;if(selectedBunnyIndex>=bunnyOptions.length)selectedBunnyIndex=0;updateBunnyDisplay();});onKeyPress("right",()=>{selectedBunnyIndex++;if(selectedBunnyIndex>=bunnyOptions.length)selectedBunnyIndex=0;updateBunnyDisplay();});
    const usernameTextDisplay=add([text(`Name: ${playerUsername}`,{size:20,font:"arial"}),pos(width()/2,height()-120),anchor("center"),area(),"usernameBtn"]);onClick("usernameBtn",()=>{const n=prompt("Enter your name:",playerUsername);if(n!==null&&n.trim()!==""){playerUsername=n.trim().slice(0,15);usernameTextDisplay.text=`Name: ${playerUsername}`}});add([text("(Click name to change)",{size:14,font:"arial"}),pos(width()/2,height()-95),anchor("center"),]);
    add([text("Let's Go!",{size:30,font:"arial"}),pos(width()/2,height()-50),anchor("center"),area(),"confirmBtn"]);onClick("confirmBtn",()=>{if(!playerUsername.trim()){alert("Please enter a name first!");return}go("game");});onKeyPress("enter",()=>{if(!playerUsername.trim()){alert("Please enter a name first!");return}go("game");});
});

scene("game", () => {
    startMusic();
    score = 0; lives = MAX_LIVES; isBunnyReacting = false;
    currentCarrotSpeed = BASE_CARROT_SPEED; currentGoblinSpeed = BASE_GOBLIN_SPEED;
    carrotsCollectedForSpeedUp = 0;

    const bgWidth=600;
    for(let i=0;i<2;i++){add([sprite("bg_back"),pos(i*bgWidth,0),z(-2),fixed(),"scrolling_bg_back"]);}
    for(let i=0;i<2;i++){add([sprite("bg_front"),pos(i*bgWidth,0),z(-1),fixed(),"scrolling_bg_front"]);}
    onUpdate("scrolling_bg_back",(bg)=>{bg.move(-BG_BACK_SPEED_EFFECTIVE,0);if(bg.pos.x<=-bgWidth){bg.pos.x+=bgWidth*2;}});
    onUpdate("scrolling_bg_front",(bg)=>{bg.move(-BG_FRONT_SPEED_EFFECTIVE,0);if(bg.pos.x<=-bgWidth){bg.pos.x+=bgWidth*2;}});

    const player=add([sprite(chosenBunnySpriteKey),pos(width()/2,height()-50),anchor("center"),area(),body({isStatic:true}),"player",{current_frame_movement:FRAME_IDLE}]);
    player.frame=FRAME_IDLE;

    // Player Keyboard Movement & Animation Control (existing)
    onKeyDown("left",()=>{player.move(-PLAYER_SPEED,0);if(player.pos.x<player.width/2)player.pos.x=player.width/2;if(!isKeyDown("right")){player.current_frame_movement=FRAME_MOVE_LEFT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=true;}});
    onKeyDown("right",()=>{player.move(PLAYER_SPEED,0);if(player.pos.x>width()-player.width/2)player.pos.x=width()-player.width/2;if(!isKeyDown("left")){player.current_frame_movement=FRAME_MOVE_RIGHT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=false;}});
    onKeyRelease(["left","right"],()=>{if(isKeyDown("left")){player.current_frame_movement=FRAME_MOVE_LEFT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=true}else if(isKeyDown("right")){player.current_frame_movement=FRAME_MOVE_RIGHT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=false}else{player.current_frame_movement=FRAME_IDLE;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=false}});

    // --- >> ADD TOUCH CONTROLS << ---
    const touchAreaWidth = width() / 2; // Each touch area takes half the screen width
    const touchAreaHeight = height();   // Full screen height for touch

    // Invisible Left Touch Area
    const leftTouchArea = add([
        rect(touchAreaWidth, touchAreaHeight), // Invisible rectangle
        pos(0, 0),                             // Top-left corner
        area(),                                // Make it respond to clicks/touches
        opacity(0),                            // Make it invisible (0 = fully transparent)
        fixed(),                               // Stays in place if camera moved
        "touchLeft"
    ]);

    // Invisible Right Touch Area
    const rightTouchArea = add([
        rect(touchAreaWidth, touchAreaHeight),
        pos(touchAreaWidth, 0),                // Starts where the left area ends
        area(),
        opacity(0),
        fixed(),
        "touchRight"
    ]);

    // Variables to track if touch is active on an area
    let touchingLeft = false;
    let touchingRight = false;

    // Handle touch start (or mousedown if touchToMouse is true)
    leftTouchArea.onClick(() => { // onClick also handles touchstart by default
        touchingLeft = true;
        touchingRight = false; // Ensure only one direction at a time if tapped quickly
    });
    rightTouchArea.onClick(() => {
        touchingRight = true;
        touchingLeft = false;
    });

    // Handle touch end (or mouseup) - Kaboom doesn't have a direct onRelease for generic objects easily,
    // so we listen globally for mouse/touch release.
    onMouseRelease(() => { // This also catches touchend due to touchToMouse default
        touchingLeft = false;
        touchingRight = false;
    });
    // More specific touchend handling if needed (requires touchToMouse: false and separate touch handlers)
    // onTouchEnd((id, pos) => {
    //     // Check if the touchend occurred within the bounds of our areas if more precision is needed
    //     touchingLeft = false;
    //     touchingRight = false;
    // });


    // Update player based on touch state in the main game loop (onUpdate)
    onUpdate(() => { // This onUpdate is global, runs every frame
        if (touchingLeft) {
            player.move(-PLAYER_SPEED * dt(), 0); // Multiply by dt() for frame-rate independent movement
            if (player.pos.x < player.width / 2) player.pos.x = player.width / 2;
            player.current_frame_movement = FRAME_MOVE_LEFT;
            if (!isBunnyReacting) player.frame = player.current_frame_movement;
            player.flipX = true;
        } else if (touchingRight) {
            player.move(PLAYER_SPEED * dt(), 0);
            if (player.pos.x > width() - player.width / 2) player.pos.x = width() - player.width / 2;
            player.current_frame_movement = FRAME_MOVE_RIGHT;
            if (!isBunnyReacting) player.frame = player.current_frame_movement;
            player.flipX = false;
        } else {
            // If neither touch area is active, and no keyboard keys are pressed, go to idle
            // This logic needs to be combined with keyboard key release for idle state
            if (!isKeyDown("left") && !isKeyDown("right")) {
                 player.current_frame_movement = FRAME_IDLE;
                 if (!isBunnyReacting) player.frame = player.current_frame_movement;
                 // player.flipX = false; // Assuming idle faces right or is symmetrical
            }
        }
    });
    // --- >> END TOUCH CONTROLS << ---


    loop(CARROT_SPAWN_RATE,()=>{play("sfx_carrot_spawn",{volume:0.4});add([sprite("carrot"),pos(rand(0,width()),0-30),anchor("center"),area(),move(DOWN,currentCarrotSpeed),offscreen({destroy:true,distance:30}),"carrot",])});
    loop(GOBLIN_SPAWN_RATE,()=>{const s=chance(.5),t=rand(140,height()-50);add([sprite("goblin"),pos(s?0-30:width()+30,t),anchor("center"),area(),move(s?RIGHT:LEFT,currentGoblinSpeed),offscreen({destroy:true}),"goblin",{initialSpeed:s?currentGoblinSpeed:-currentGoblinSpeed}])});
    player.onCollide("carrot",(c)=>{play("sfx_player_catch",{volume:0.6});destroy(c);score+=10;scoreText.text=`Score: ${score}`;carrotsCollectedForSpeedUp++;if(carrotsCollectedForSpeedUp>=CARROTS_PER_SPEED_UP){play("sfx_speed_up",{volume:0.7});currentCarrotSpeed*=SPEED_INCREASE_FACTOR;currentGoblinSpeed*=SPEED_INCREASE_FACTOR;console.log(`SPEED UP!`);carrotsCollectedForSpeedUp=0;}});
    onCollide("goblin","carrot",(g,c)=>{const s=["sfx_goblin_steal_1","sfx_goblin_steal_2","sfx_goblin_steal_3"];play(choose(s),{volume:0.5});destroy(c);if(!isBunnyReacting){isBunnyReacting=!0;player.frame=FRAME_REACTION_SAD;wait(BUNNY_REACTION_TIME,()=>{isBunnyReacting=!1;player.frame=player.current_frame_movement})}if(!g.is("sprinting")){g.use("sprinting");g.use(lifespan(3,{fade:.1}));g.sprintDirection=g.initialSpeed>0?1:-1}});
    onUpdate("sprinting",(g)=>{const v=currentGoblinSpeed*GOBLIN_SPRINT_SPEED_MULTIPLIER;g.move(g.sprintDirection*v,0);});
    add([rect(width(),10),pos(0,height()-5),area(),body({isStatic:true}),"ground"]);
    onCollide("carrot","ground",(c,g)=>{destroy(c);if(lives>0){lives--;livesText.text=`Lives: ${lives}`;if(lives===MAX_LIVES-1){play("sfx_first_death",{volume:0.6})}else if(lives===MAX_LIVES-2){play("sfx_second_death",{volume:0.6})}else if(lives===0){play("sfx_final_death",{volume:0.7})}if(lives<=0){wait(.7,()=>{go("gameOver",{finalScore:score,playerName:playerUsername});})}}});
    const scoreText=add([text(`Score: ${score}`,{size:24,font:"arial"}),pos(10,10),fixed(),]);const livesText=add([text(`Lives: ${lives}`,{size:24,font:"arial"}),pos(width()-10,10),anchor("topright"),fixed(),]);
});

scene("gameOver", ({ finalScore, playerName }) => {
    stopMusic(); play("sfx_game_over",{volume:0.7});
    add([sprite("game_over_bg"),pos(0,0),z(-1)]);
    const earnedCurrency=Math.max(0,Math.floor(finalScore/10));let currentCoins=parseInt(localStorage.getItem("carrotCoins"))||0;currentCoins+=earnedCurrency;localStorage.setItem("carrotCoins",currentCoins);addHighScore(playerName,finalScore);const o=getHighScores();add([text(`Game Over, ${playerName}!\nScore: ${finalScore}\nEarned: ${earnedCurrency} coins`,{size:28,align:"center",font:"arial"}),pos(width()/2,60),anchor("center")]);add([text("High Scores:",{size:22,font:"arial"}),pos(width()/2,140),anchor("center")]);let a=170;o.forEach((n,r)=>{add([text(`${r+1}. ${n.name} - ${n.score}`,{size:18,font:"arial"}),pos(width()/2,a),anchor("center")]);a+=25});
    add([text("Play Again",{size:20,font:"arial"}),pos(width()/2,height()-90),anchor("center"),area(),"playAgainCurrentBtn"]);onClick("playAgainCurrentBtn",()=>{startMusic();go("game");});onKeyPress("enter",()=>{startMusic();go("game");});
    add([text("Change Bunny / Name",{size:20,font:"arial"}),pos(width()/2,height()-50),anchor("center"),area(),"changeCharBtn"]);onClick("changeCharBtn",()=>{startMusic();go("charSelect");});
});

go("start");
