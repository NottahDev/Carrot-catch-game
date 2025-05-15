    // --- >> REFINED onUpdate FOR TOUCH MOVEMENT AND IDLE STATE << ---
    let isMovingByTouch = false; // Flag to help manage idle state with keyboard

    onUpdate(() => {
        isMovingByTouch = false; // Reset each frame

        if (touchingLeft) {
            player.move(-PLAYER_SPEED * dt(), 0); // MOVEMENT CODE
            if (player.pos.x < player.width / 2) player.pos.x = player.width / 2; // Boundary
            if (!isBunnyReacting) { // Animation/facing
                player.current_frame_movement = FRAME_MOVE_LEFT;
                player.frame = FRAME_MOVE_LEFT;
            }
            player.flipX = true;
            isMovingByTouch = true;
        } else if (touchingRight) {
            player.move(PLAYER_SPEED * dt(), 0); // MOVEMENT CODE
            if (player.pos.x > width() - player.width / 2) player.pos.x = width() - player.width / 2; // Boundary
            if (!isBunnyReacting) { // Animation/facing
                player.current_frame_movement = FRAME_MOVE_RIGHT;
                player.frame = FRAME_MOVE_RIGHT;
            }
            player.flipX = false;
            isMovingByTouch = true;
        }

        // Handle idle state ONLY if not moving by touch AND no keyboard keys are pressed
        if (!isMovingByTouch && !isKeyDown("left") && !isKeyDown("right")) {
            if (!isBunnyReacting) {
                if (player.current_frame_movement !== FRAME_IDLE) {
                     player.current_frame_movement = FRAME_IDLE;
                     player.frame = FRAME_IDLE;
                     player.flipX = false; 
                }
            }
        }
    });
    // --- >> END REFINED onUpdate << ---
