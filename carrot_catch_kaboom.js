// Initialize Kaboom context
kaboom({
    width: 600,
    height: 400, // Our game's native resolution
    font: "sans-serif",
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
loadSprite("bg_back", "img/bg_back.png");    // Should be 600x400 ideally
loadSprite("bg_front", "img/bg_front.png");  // Should be 600x400 ideally
loadSprite("title_bg", "img/title_screen_bg.png");
// loadSprite("game_over_bg", "img/game_over_bg.png"); // No longer loading this as we'll use bg_back
loadSprite("heart", "img/heart.png");
loadSprite("heart_empty", "img/heart_empty.png");
loadSprite("score_icon", "img/score.png");

loadSprite("game_over_title_img", "img/game_over_title.png");
loadSprite("coins_label_img", "img/coins_label.png");
loadSprite("play_again_btn_img", "img/play_again_button.png");
loadSprite("change_bunny_btn_img", "img/change_bunny_button.png");
loadSprite("high_score_title_img", "img/high_score_title.png");

// Sounds
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
loadSound("sfx_yay_extra_life", "sfx/yay.mp3");


// --- Game Variables (no changes) ---
const PLAYER_SPEED = 320; const BASE_CARROT_SPEED = 120; let currentCarrotSpeed = BASE_CARROT_SPEED; const BASE_GOBLIN_SPEED = 80; let currentGoblinSpeed = BASE_GOBLIN_SPEED; const GOBLIN_SPRINT_SPEED_MULTIPLIER = 4; const CARROT_SPAWN_RATE = 1.2; const GOBLIN_SPAWN_RATE = 3.5; const BG_BACK_SPEED_EFFECTIVE = 20; const BG_FRONT_SPEED_EFFECTIVE = 50; let score = 0; let lives = 3; const MAX_LIVES = 3; const FRAME_IDLE = 0; const FRAME_MOVE_RIGHT = 3; const FRAME_MOVE_LEFT = 4; const FRAME_REACTION_SAD = 2; const BUNNY_REACTION_TIME = 0.7; let isBunnyReacting = false; let carrotsCollectedForSpeedUp = 0; const CARROTS_PER_SPEED_UP = 10; const SPEED_INCREASE_FACTOR = 1.5; const EXTRA_LIFE_CHANCE = 0.01; const HEART_FALL_SPEED = 100;
const bunnyOptions = [ { name: "Original", spriteKey: "bunny_original", colorText: "Classic Bun" }, { name: "Blue", spriteKey: "bunny_blue", colorText: "Azure Hopster" }, { name: "Green", spriteKey: "bunny_green", colorText: "Forest Green" }, { name: "Pink", spriteKey: "bunny_pink", colorText: "Bubblegum Pink" }, { name: "Yellow", spriteKey: "bunny_yellow", colorText: "Sunny Yellow" }, ];
let selectedBunnyIndex = 0; let chosenBunnySpriteKey = bunnyOptions[selectedBunnyIndex].spriteKey; let playerUsername = "Player"; const HIGH_SCORE_KEY = "carrotCatchHighScores"; const MAX_HIGH_SCORES = 5; let musicPlayer = null; let lifeHeartsUI = []; let scoreTextUI = null; let scoreIconUI = null;
function getHighScores(){const s=localStorage.getItem(HIGH_SCORE_KEY);return s?JSON.parse(s):[]}
function addHighScore(n,s){const o=getHighScores();o.push({name:n,score:s});o.sort((a,b)=>b.score-a.score);const t=o.slice(0,MAX_HIGH_SCORES);localStorage.setItem(HIGH_SCORE_KEY,JSON.stringify(t));return t}
function startMusic(){if(!musicPlayer||(musicPlayer&&musicPlayer.paused)){if(musicPlayer&&typeof musicPlayer.stop==="function"){musicPlayer.stop()}musicPlayer=play("bg_music",{loop:true,volume:0.5,})}}
function stopMusic(){if(musicPlayer&&typeof musicPlayer.stop==="function"){musicPlayer.stop()}}

// --- Game Scenes ---
scene("start", () => { /* ... start scene ... */
    add([sprite("title_bg"), pos(0,0), z(-1)]);
    const startInteractions=()=>{startMusic();go("charSelect");};
    onClick(startInteractions);onKeyPress("enter",startInteractions);
});

scene("charSelect", () => { /* ... charSelect scene ... */
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
    startMusic(); score = 0; lives = MAX_LIVES; isBunnyReacting = false; currentCarrotSpeed = BASE_CARROT_SPEED; currentGoblinSpeed = BASE_GOBLIN_SPEED; carrotsCollectedForSpeedUp = 0; lifeHeartsUI = [];
    const bgWidth=600;

    // Back Background (no change)
    for(let i=0;i<2;i++){add([sprite("bg_back"),pos(i*bgWidth,0),z(-2),fixed(),"scrolling_bg_back"]);}

    // <<<< FRONT BACKGROUND - POSITIONING ADJUSTMENT >>>>
    // If bg_front is exactly 400px tall, pos(i * bgWidth, 0) should be fine.
    // If it's slightly taller and you want to clip the top, or if it's shorter
    // and you want to align to bottom, adjustments might be needed.
    // For a 5px gap at the bottom, and assuming bg_front is 400px tall,
    // this implies the canvas itself might have a sub-pixel rendering issue or
    // the image has a transparent line.
    // Let's try ensuring it's perfectly at y=0 and see.
    // If your bg_front image is, for example, 395px tall and you want it at the bottom,
    // you'd use pos(i * bgWidth, height() - 395).
    // Assuming bg_front is meant to be 600x400:
    for(let i=0;i<2;i++){
        add([
            sprite("bg_front"),
            pos(i * bgWidth, 0), // Ensure Y is exactly 0
            // anchor("topleft"), // Explicitly anchor to topleft
            z(-1),
            fixed(),
            "scrolling_bg_front"
        ]);
    }
    onUpdate("scrolling_bg_back",(bg)=>{bg.move(-BG_BACK_SPEED_EFFECTIVE,0);if(bg.pos.x<=-bgWidth){bg.pos.x+=bgWidth*2;}});
    onUpdate("scrolling_bg_front",(bg)=>{bg.move(-BG_FRONT_SPEED_EFFECTIVE,0);if(bg.pos.x<=-bgWidth){bg.pos.x+=bgWidth*2;}});

    const player=add([sprite(chosenBunnySpriteKey),pos(width()/2,height()-50),anchor("center"),area(),body({isStatic:true}),"player",{current_frame_movement:FRAME_IDLE}]); player.frame=FRAME_IDLE;
    onKeyDown("left",()=>{player.move(-PLAYER_SPEED,0);if(player.pos.x<player.width/2)player.pos.x=player.width/2;if(!isKeyDown("right")){player.current_frame_movement=FRAME_MOVE_LEFT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=true;}}); onKeyDown("right",()=>{player.move(PLAYER_SPEED,0);if(player.pos.x>width()-player.width/2)player.pos.x=width()-player.width/2;if(!isKeyDown("left")){player.current_frame_movement=FRAME_MOVE_RIGHT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=false;}}); onKeyRelease(["left","right"],()=>{if(isKeyDown("left")){player.current_frame_movement=FRAME_MOVE_LEFT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=true}else if(isKeyDown("right")){player.current_frame_movement=FRAME_MOVE_RIGHT;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=false}else{player.current_frame_movement=FRAME_IDLE;if(!isBunnyReacting)player.frame=player.current_frame_movement;player.flipX=false}});
    let isMovingByTouch = false; onUpdate(()=>{isMovingByTouch=!1;const MOVE_AMOUNT=3;if(touchingLeft){player.pos.x-=MOVE_AMOUNT;if(player.pos.x<player.width/2)player.pos.x=player.width/2;if(!isBunnyReacting){player.current_frame_movement=FRAME_MOVE_LEFT;player.frame=FRAME_MOVE_LEFT}player.flipX=!0;isMovingByTouch=!0}else if(touchingRight){player.pos.x+=MOVE_AMOUNT;if(player.pos.x>width()-player.width/2)player.pos.x=width()-player.width/2;if(!isBunnyReacting){player.current_frame_movement=FRAME_MOVE_RIGHT;player.frame=FRAME_MOVE_RIGHT}player.flipX=!1;isMovingByTouch=!0}if(!isMovingByTouch&&!isKeyDown("left")&&!isKeyDown("right")){if(!isBunnyReacting){if(player.current_frame_movement!==FRAME_IDLE){player.current_frame_movement=FRAME_IDLE;player.frame=FRAME_IDLE;player.flipX=!1}}}});
    const touchAreaWidth = width()/2; const touchAreaHeight = height(); const leftTouchArea=add([rect(touchAreaWidth,touchAreaHeight),pos(0,0),area(),opacity(0),fixed(),"touchLeft"]); const rightTouchArea=add([rect(touchAreaWidth,touchAreaHeight),pos(touchAreaWidth,0),area(),opacity(0),fixed(),"touchRight"]); let touchingLeft = false; let touchingRight = false; leftTouchArea.onClick(()=>{touchingLeft=true;touchingRight=false;}); rightTouchArea.onClick(()=>{touchingRight=true;touchingLeft=false;}); onMouseRelease(()=>{touchingLeft=false;touchingRight=false;});
    loop(CARROT_SPAWN_RATE,()=>{if(rand()<EXTRA_LIFE_CHANCE){play("sfx_carrot_spawn",{volume:0.6,speed:1.2});add([sprite("heart"),pos(rand(0,width()),0-30),anchor("center"),scale(0.8),area(),move(DOWN,HEART_FALL_SPEED),offscreen({destroy:true,distance:30}),"extraLife",])}else{play("sfx_carrot_spawn",{volume:0.4});add([sprite("carrot"),pos(rand(0,width()),0-30),anchor("center"),area(),move(DOWN,currentCarrotSpeed),offscreen({destroy:true,distance:30}),"carrot",])}});
    loop(GOBLIN_SPAWN_RATE,()=>{const s=chance(.5),t=rand(140,height()-50);add([sprite("goblin"),pos(s?0-30:width()+30,t),anchor("center"),area(),move(s?RIGHT:LEFT,currentGoblinSpeed),offscreen({destroy:true}),"goblin",{initialSpeed:s?currentGoblinSpeed:-currentGoblinSpeed}])});
    function updateScoreDisplay(){if(scoreTextUI){scoreTextUI.text=`${score}`}}
    player.onCollide("carrot",(c)=>{play("sfx_player_catch",{volume:0.6});destroy(c);score+=10;updateScoreDisplay();carrotsCollectedForSpeedUp++;if(carrotsCollectedForSpeedUp>=CARROTS_PER_SPEED_UP){play("sfx_speed_up",{volume:0.7});currentCarrotSpeed*=SPEED_INCREASE_FACTOR;currentGoblinSpeed*=SPEED_INCREASE_FACTOR;console.log(`SPEED UP!`);carrotsCollectedForSpeedUp=0;}});
    player.onCollide("extraLife",(l)=>{destroy(l);if(lives<MAX_LIVES){lives++;play("sfx_yay_extra_life",{volume:.8});updateLifeHeartsUI()}else{score+=25;updateScoreDisplay();play("sfx_player_catch",{volume:.5})}});
    onCollide("goblin","carrot",(g,c)=>{const s=["sfx_goblin_steal_1","sfx_goblin_steal_2","sfx_goblin_steal_3"];play(choose(s),{volume:0.5});destroy(c);if(!isBunnyReacting){isBunnyReacting=!0;player.frame=FRAME_REACTION_SAD;wait(BUNNY_REACTION_TIME,()=>{isBunnyReacting=!1;player.frame=player.current_frame_movement})}if(!g.is("sprinting")){g.use("sprinting");g.use(lifespan(3,{fade:.1}));g.sprintDirection=g.initialSpeed>0?1:-1}});
    onUpdate("sprinting",(g)=>{const v=currentGoblinSpeed*GOBLIN_SPRINT_SPEED_MULTIPLIER;g.move(g.sprintDirection*v,0);});
    add([rect(width(),10),pos(0,height()-5),area(),body({isStatic:true}),"ground"]);
    function updateLifeHeartsUI(){lifeHeartsUI.forEach(h=>destroy(h));lifeHeartsUI=[];for(let i=0;i<MAX_LIVES;i++){const s=i<lives?"heart":"heart_empty";lifeHeartsUI.push(add([sprite(s),pos(width()-10-(i*30),10),anchor("topright"),scale(0.7),fixed(),z(10)]))}}; updateLifeHeartsUI();
    function loseLife(){if(lives>0){lives--;updateLifeHeartsUI();if(lives===MAX_LIVES-1&&MAX_LIVES>1){play("sfx_first_death",{volume:0.6})}else if(lives===MAX_LIVES-2&&MAX_LIVES>2){play("sfx_second_death",{volume:0.6})}else if(lives===0){play("sfx_final_death",{volume:0.7})}if(lives<=0){wait(.7,()=>{go("gameOver",{finalScore:score,playerName:playerUsername});})}}}; onCollide("carrot","ground",(c,g)=>{destroy(c);loseLife();});
    scoreIconUI = add([sprite("score_icon"),pos(10,10),scale(0.8),fixed(),z(10)]); scoreTextUI = add([text(`${score}`,{size:24,font:"arial"}),pos(10+scoreIconUI.width*0.8+5,10+(scoreIconUI.height*0.8*0.5)),anchor("left"),fixed(),z(10)]);
});

// Game Over Scene
scene("gameOver", ({ finalScore, playerName }) => {
    stopMusic();
    play("sfx_game_over", { volume: 0.7 });

    // <<<< USE bg_back FOR GAME OVER SCREEN >>>>
    add([sprite("bg_back"), pos(0, 0), z(-10)]); // Changed from game_over_bg

    add([sprite("game_over_title_img"), pos(width()/2, 50), anchor("center"), scale(1), z(-9)]); // Title moved up

    const leftColumnX = width() * 0.25;
    let contentStartY = 130;
    const itemSpacingY = 45;
    const iconTextSpacingX = 8;
    const uiScale = 0.7;
    const valueTextSize = 18;

    add([sprite(chosenBunnySpriteKey,{frame:FRAME_IDLE}),pos(leftColumnX-30,contentStartY),anchor("center"),scale(2.2),z(-8)]);
    contentStartY += itemSpacingY + 10;
    const scoreIconGO=add([sprite("score_icon"),pos(leftColumnX-30,contentStartY+20),anchor("center"),scale(uiScale*1.3),z(-8)]);
    add([text(`${finalScore}`,{size:valueTextSize,font:"arial"}),pos(scoreIconGO.pos.x+scoreIconGO.width*(uiScale*1.3)/2+iconTextSpacingX,scoreIconGO.pos.y),anchor("left"),z(-8)]);
    contentStartY += itemSpacingY;
    const earnedCurrency=Math.max(0,Math.floor(finalScore/10));
    const coinsLabelGO=add([sprite("coins_label_img"),pos(leftColumnX-30,contentStartY+20),anchor("center"),scale(uiScale*0.9),z(-8)]);
    add([text(`${earnedCurrency}`,{size:valueTextSize,font:"arial"}),pos(coinsLabelGO.pos.x+coinsLabelGO.width*(uiScale*0.9)/2+iconTextSpacingX,coinsLabelGO.pos.y),anchor("left"),z(-8)]);

    const rightColumnX = width() * 0.75;
    addHighScore(playerName, finalScore);
    const highScores = getHighScores();
    add([sprite("high_score_title_img"),pos(rightColumnX,130-20),anchor("center"),scale(0.8*1.3),z(-8)]);
    let hs_yPos=130+30;const hs_lineHeight=20; const hs_textSize = 15;
    highScores.forEach((entry,index)=>{if(index<MAX_HIGH_SCORES){let textColor=rgb(255,255,255);if(entry.name===playerName&&entry.score===finalScore&&!entry.highlighted){textColor=rgb(255,255,0);entry.highlighted=!0}add([text(`${index+1}. ${entry.name.slice(0,8)} - ${entry.score}`,{size:hs_textSize,font:"arial",color:textColor}),pos(rightColumnX,hs_yPos+(index*hs_lineHeight)),anchor("center"),z(-8)])}});

    const buttonY=height()-50;const buttonSpacing=120;const buttonScale=0.7;
    add([sprite("play_again_btn_img"),pos(width()/2-buttonSpacing/2,buttonY),anchor("center"),area(),"playAgainBtnGO",z(-8),scale(buttonScale)]);onClick("playAgainBtnGO",()=>{startMusic();go("game");});onKeyPress("enter",()=>{startMusic();go("game");});
    add([sprite("change_bunny_btn_img"),pos(width()/2+buttonSpacing/2,buttonY),anchor("center"),area(),"changeCharBtnGO",z(-8),scale(buttonScale)]);onClick("changeCharBtnGO",()=>{startMusic();go("charSelect");});
});

// Start the game
go("start");
