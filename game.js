    var context = canvas.getContext("2d");
    var shape = new Object();
    var board;
    var score;
    var pac_color;
    var start_time;
    var time_elapsed;
    var interval;
    var interval_moving_score;
    var interval_move_ghosts;
    var interval_music;
    var audio;
    var moving_score_x;
    var moving_score_y;
    var LIFE;
    var ghosts_location;
    var lastDirection ; 
    var interval_play_song;
    var audio;
    var music_playing=false;
    var controls;
    var pointsProb;
    var monster_amount;
    var eaten50;
    var game_time ;
    var DEFAULT_UP_KEY = "ArrowUp";
    var DEFAULT_DOWN_KEY = "ArrowDown";
    var DEFAULT_LEFT_KEY = "ArrowLeft";
    var DEFAULT_RIGHT_KEY = "ArrowRight";
    var MIN_PASS_LENGTH = 8;//change if necessary
    var contains_letter = RegExp('[A-Za-z]');//checks for characters between a-z or A-z in the input
    var contains_digit = RegExp('[0-9]');//checks for digits in the inputs
    var filled = RegExp('.');//checks for non-empty input
    var over_n_chars = RegExp('.'.repeat(MIN_PASS_LENGTH));//checks for input length: must be 8 or longer
    var regexemail = /^([a-zA-Z0-9_\.\-\+]*[A-Za-z]+[a-zA-Z0-9_\.\-\+]*)\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/;//checks for valid email

    function Start() {
		
        game_time=10;
        pointsProb=1;
        board = new Array();
        LIFE=3;
        score = 0;
        pac_color = "yellow";
        var cnt = 100;
		//var extra_food=60;
        var food_remain =90;
        var pacman_remain = 1;
        mount_openning=(1===0);/**/
        moving_score_x=9;
        moving_score_y=9;
		eaten50=false;
        start_time = new Date().getTime();

        controls = [retrieve('up_key'),retrieve('down_key'),retrieve('left_key'),retrieve('right_key'),retrieve('no_of_ghosts'),retrieve('no_of_points'),retrieve('time')];
        if(!controls[0]){ controls[0] = DEFAULT_UP_KEY;}
        if(!controls[1]){ controls[1] = DEFAULT_DOWN_KEY;}
        if(!controls[2]){ controls[2] = DEFAULT_LEFT_KEY;}
        if(!controls[3]){ controls[3] = DEFAULT_RIGHT_KEY;}
        if(!controls[4]){ controls[4] = 3;}
        if(!controls[5]){ controls[5] = 50;}
        if(!controls[6]){ controls[6] = 60;}

        food_remain = controls[5];
        game_time = controls[6];


        for (var i = 0; i < 10; i++) {
            board[i] = new Array();
            //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
            for (var j = 0; j < 10; j++) {
                if ((i === 3 && j === 3) || (i === 3 && j === 4) || (i === 3 && j === 5) || (i === 6 && j === 1) || (i === 6 && j === 2)) {
                     board[i][j] = 4;
                } else {
                    var randomNum = Math.random();
                        if (randomNum <= 1.0 * food_remain / cnt) {
                            food_remain--;
                            var randomNum2 = Math.random();
                            if (randomNum2<=pointsProb){   
                                var randomNum3 = Math.random();
                                if (randomNum3<=0.6)    
                                    board[i][j] = 1.05;
                                if (randomNum3>0.6&&randomNum3<=0.9)    
                                    board[i][j] = 1.15;
                                if (randomNum3>0.9)    
                                    board[i][j] = 1.25;
                            }
                        } else if (randomNum < 1.0 * (pacman_remain + food_remain) / cnt) {
                        	shape.i=i;
                        	shape.j=j;
                            pacman_remain--;
                            board[i][j] = 2;
                        } else {
                            board[i][j] = 0;
                        }
                    cnt--;
                }
            
            }

        }
        board[4][5]=1.9; //slowmo pill
        board[4][6]=1.99; //slowmo pill
        board[4][4]=1.99; //slowmo pill
        monster_amount= parseInt(controls[4]);
        switch(monster_amount){
            case 1:
				board[0][0] = 5; //GHOST
                ghosts_location=[[0,0]];
                break;
            case 2:
                board[0][9] = 5; //GHOST
                board[0][0] = 5; //GHOST
                ghosts_location=[[0,0],[0,9]];
                break;

            case 3:
                board[0][9] = 5; //GHOST
                board[0][0] = 5; //GHOST
                board[9][0] = 5; //GHOST
                ghosts_location=[[0,0],[0,9],[9,0]];
                break;

		}
        while (food_remain > 0) {
            var emptyCell = findRandomEmptyCell(board);
            board[emptyCell[0]][emptyCell[1]] = 1;
            food_remain--;
        }
        keysDown = {};
        addEventListener("keydown", function (e) {
            keysDown[e.key] = true;
        }, false);
        addEventListener("keyup", function (e) {
            keysDown[e.key] = false;
        }, false);
        interval = setInterval(UpdatePosition, 150);
        board[moving_score_x][moving_score_y]=3;
 /**/   interval_moving_score = setInterval(moving_score, 10*150);
        interval_move_ghosts = setInterval(move_ghosts, 10*150);
        if(!music_playing){
            play_music('audio_file.mp3');
            music_playing=true;
        }

    }
    function Reload(){
        var context = canvas.getContext("2d");
        var shape = new Object();
        clearInterval(interval);
        clearInterval(interval_moving_score);
        clearInterval(interval_move_ghosts);
        Start();
    }

    /*stores a given value under a given label for later retrieval. 
     *lasts until overridden by another call to this function, or until the session ends.
     */
    function store(name,value){
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem(name, value);// Store
        } 
        else {
            print("Sorry, your browser does not support Web Storage...");
        }
    }

    /*retrieves the recent value stored under a given name/
     */
    function retrieve(name){
        if (typeof(Storage) !== "undefined") {
            return sessionStorage.getItem(name);// Retrieve
        } 
        else {
            print("Sorry, your browser does not support Web Storage...");
        }
    }

    function play_music(source){
        audio = new Audio(source);
        audio.loop=true;
        audio.play();
    }

    function move_ghosts () {
        var i;
        for (i = 0, len = ghosts_location.length; i < len; i++) { 

            var direction = direction_ghosts([ghosts_location[i][0],ghosts_location[i][1]]);

            var prevScore =board  [ghosts_location[i][0]+direction[0]][ghosts_location[i][1]+direction[1]];

            board  [ghosts_location[i][0]+direction[0]][ghosts_location[i][1]+direction[1]]=5;

            board  [ghosts_location[i][0]][ghosts_location[i][1]]=prevScore;

            ghosts_location[i][0]=ghosts_location[i][0]+direction[0];
            ghosts_location[i][1]=ghosts_location[i][1]+direction[1];
        }
        
    }

    function direction_ghosts(ghost_location) {
        
        var ghost_location1 = ghost_location; 
        var random = Math.random()
        if(random>0.5){
        if(isValid([ghost_location[0]],[ghost_location[1]+=1]))
            return [0,1] ;

         if(isValid([ghost_location[0]],[ghost_location[1]-=1]))
         return [0,-1] ;
        }
        else{
         if(isValid([ghost_location[0]+=1],[ghost_location[1]]))
         return [1,0] ;

        if(isValid([ghost_location[0]-=1],[ghost_location[1]]))
        return [-1,0] ;
        }
    }

    function isValid(i, j) {
        if (j >= 0 && j <= 9 && i >= 0 && i <= 9 && board[i][j] !== 4 && board[i][j] !== 5 ) {
            return true;
        }
        else {
            return false;
        }
    }

    function moving_score() {
		if(!eaten50){
        var x= findRandomEmptyCell(board);
        board [moving_score_x][moving_score_y]=0;
        moving_score_x=x[0];
        moving_score_y=x[1];
        board[moving_score_x][moving_score_y]=3;
		}
    }

    function findRandomEmptyCell(board) {
        var i = Math.floor((Math.random() * 9) + 1);
        var j = Math.floor((Math.random() * 9) + 1);
        while (board[i][j] !== 0 || board[i][j] === 5) {
            i = Math.floor((Math.random() * 9) + 1);
            j = Math.floor((Math.random() * 9) + 1);
        }
        return [i, j];
    }

    function updateLabel(paragraph_id,val) {
        document.getElementById(paragraph_id).innerHTML=val; 
    }

    function randomiseInput(){
        ghosts = document.getElementById("no_of_ghosts");
        random = "" + getRandomInt(ghosts.min,ghosts.max);
        ghosts.value = random;
        updateLabel("no_of_ghosts",random);

        points = document.getElementById("no_of_points");
        random = "" + getRandomInt(points.min,points.max);
        points.value = random;
        updateLabel("no_of_points",random);  

        time = document.getElementById("time");
        random = "" + getRandomInt(time.min,time.max);
        time.value = random;
        updateLabel("time",random);  
    }

    function getRandomInt(min,max){
        return Math.random()*(parseInt(max) - parseInt(min)) + parseInt(min);
    }

    function saveSettings(){
        store("up_key",document.getElementById('form_up_key').value);
        store("down_key",document.getElementById('form_down_key').value);
        store("left_key",document.getElementById('form_left_key').value);
        store("right_key",document.getElementById('form_right_key').value);
        store("no_of_ghosts",document.getElementById('no_of_ghosts').value);
        store("no_of_points",document.getElementById('no_of_points').value);
        store("time",document.getElementById('time').value);
        swapDiv("gamediv");
    }

    function toggle(elemName){
        var elem = document.getElementById(elemName);
        if(elem.style.display === "none"){
            elem.style.display = "block";
        } 
        else{
            elem.style.display = "none";
        }
    }

    function swapDiv(div_id){
        if (typeof curr_div_id === 'undefined'){
            curr_div_id = "welcomediv";
            store('a','a');
        }
        toggle(curr_div_id);//hide previous div
        toggle(div_id);//show current div
        curr_div_id = div_id;//change the auxiliary var
    }

    /**
     * @return {number}
     */
    function GetKeyPressed() {
        if (keysDown[controls[0]]) {
            lastDirection =  1;
            return 1; 
        }
        if (keysDown[controls[1]]) {
            lastDirection =  2;
            return 2; 

        }
        if (keysDown[controls[2]]) {
            lastDirection =  3;
            return 3; 

        }
        if (keysDown[controls[3]]) {
            lastDirection =  4;
            return 4; 
        }
    }

    function Draw() {
        context.clearRect(0, 0, canvas.width, canvas.height); //clean board
        lblScore.value = score;
        lblTime.value = time_elapsed;
        lblLife.value=LIFE;
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                var center = new Object();
                center.x = i * 60 + 30;
                center.y = j * 60 + 30;
                if (board[i][j] === 2) {
                    context.beginPath();
            /**/        var eye_x=5;
                        var eye_y=-15;
                        var mouth_loc1 =0.15;
                        var mouth_loc2 =1.85 ;
                        switch (lastDirection) {
                            case 1:
                                eye_x = -15;
                                eye_y = -5;
                                mouth_loc1 =1+1-0.15;
                                mouth_loc2 =1+0.15 ;
                                break;
                            case 2:
                                eye_x = -15;
                                eye_y = +5;
                                mouth_loc1 =1-0.15;
                                mouth_loc2 =0.15 ;
                                break;
                            case 3:
                                eye_x = -5;
                                eye_y = -15;
                                mouth_loc1 =1.1;
                                mouth_loc2 =0.85 ;
                                break;
                            case 4:
                                eye_x = +5;
                                eye_y = -15;
                                mouth_loc1 =0.15;
                                mouth_loc2 =1.85 ;

                                break;
                        }
                        context.arc(center.x, center.y, 30, (mouth_loc1) * Math.PI, (mouth_loc2) * Math.PI); // half circle
                        context.lineTo(center.x, center.y);
                        context.fillStyle = pac_color; //color
                        context.fill();
                        context.beginPath();
                        context.arc(center.x + eye_x, center.y + eye_y, 5, 0, 2 * Math.PI); // circle
                       /**/ context.fillStyle = "black"; //color
                        context.fill();
                } else if (board[i][j] === 1.99) {
                    context.beginPath();
                    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                    context.fillStyle = "green"; //color
                    context.fill();
                } else if (board[i][j] === 1.9) {
                    context.beginPath();
                    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                    context.fillStyle = "blue"; //color
                    context.fill();
                } else if (board[i][j] === 1.05) {
                    context.beginPath();
                    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                    context.fillStyle = "orange"; //color
                    context.fill();
                }
                else if (board[i][j] === 1.15) {
                    context.beginPath();
                    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                    context.fillStyle = "silver"; //color
                    context.fill();
                }
                else if (board[i][j] === 1.25) {
                    context.beginPath();
                    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                    context.fillStyle = "gold"; //color
                    context.fill();
                } 
                else if (board[i][j] === 4) {
                    context.beginPath();
                    context.rect(center.x - 30, center.y - 30, 60, 60);
                    context.fillStyle = "grey"; //color
                    context.fill();
                }
                else if (board[i][j] === 3) {
                    context.beginPath();
                    context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                    context.fillStyle = "red"; //color
                    context.fill();
                }
                else if (board[i][j] === 5) {
                    context.beginPath();
                    context.arc(center.x, center.y, 30, 0, 2 * Math.PI); // circle
                    context.fillStyle = "pink"; //color
                    context.fill();
                }
                
            }
        }


    }

    function UpdatePosition() {
        board[shape.i][shape.j] = 0;
        GetKeyPressed();
        var x = lastDirection;
        if (x === 1) {
            if (shape.j > 0 && board[shape.i][shape.j - 1] !== 4) {
                shape.j--;
            }
        }
        if (x === 2) {
            if (shape.j < 9 && board[shape.i][shape.j + 1] !== 4) {
                shape.j++;
            }
        }
        if (x === 3) {
            if (shape.i > 0 && board[shape.i - 1][shape.j] !== 4) {
                shape.i--;
            }
        }
        if (x === 4) {
            if (shape.i < 9 && board[shape.i + 1][shape.j] !== 4) {
                shape.i++;
            }
        }
        if (board[shape.i][shape.j] === 1.9) {
            clearInterval(interval_move_ghosts);
            interval_move_ghosts = setInterval(move_ghosts, 20*150);
        }
        if (board[shape.i][shape.j] === 1.99) {
            LIFE++;
        }
        if (board[shape.i][shape.j] === 1.05) {
            score+=5;
        }
        if (board[shape.i][shape.j] === 1.15) {
            score+=15;
        }
        if (board[shape.i][shape.j] === 1.25) {
            score+=25;
        }
        if (board[shape.i][shape.j] === 3) {
			eaten50=true;
            score=score+50;
        }
        if (board[shape.i][shape.j] === 5) {
            LIFE--;
            score=score-10;
            for (i = 0, len = ghosts_location.length; i < len; i++) { 
                board[ghosts_location[i][0]][ghosts_location[i][1]]=0;
            }
            switch(monster_amount){
				case 1:
					board[0][0] = 5; //GHOST
					ghosts_location=[[0,0]];
					break;
				case 2:
					board[0][9] = 5; //GHOST
					board[0][0] = 5; //GHOST
					ghosts_location=[[0,0],[0,9]];
					break;

				case 3:
					board[0][9] = 5; //GHOST
					board[0][0] = 5; //GHOST
					board[9][0] = 5; //GHOST
					ghosts_location=[[0,0],[0,9],[9,0]];
					break;

            }
            var new_location = findRandomEmptyCell(board);
            shape.i=new_location[0];
            shape.j=new_location[1];
            board[new_location[0]][new_location[1]] = 2;

        }
        /*for (var ghost in ghosts_location){
            board[ghost[0]][ghost[1]++]=5;
        }*/
        board[shape.i][shape.j] = 2;

        var currentTime = new Date();
        time_elapsed =game_time- (currentTime - start_time) / 1000;
        if (score >= 20 && time_elapsed <= 10) {
            pac_color = "green";
        }

        if (LIFE <= 0) {
            audio.pause();
            play_music("lose.mp3");
            window.clearInterval(interval);
            window.alert("You Lost!");

        }
        if (time_elapsed<=0) {
            audio.pause();
            play_music("lose.mp3");
            window.clearInterval(interval);
            window.alert("You can do better, your score is: "+score);

        }
        if (score >= 150) {
            audio.pause();
            play_music("win.mp3");
            window.clearInterval(interval);
            window.alert("We have a Winner!!!");

        } else {
            Draw();
        }
    }

    /* this function is called every time a key is pressed in the sign up form.
     * it defines 6 booleans, who define whether a field's current input is valid.
     * if all 6 booleans are true, the submit button will be enabled and the user can finish up the registration process.
     * if not, specific errors will be shown as to why the booleans were false.
     */
    function validateSignup(){

        clearErrorParagraphs('signup');

        var input_username = $('#suUser').val();
        var input_password = $('#suPass').val();
        var input_firstname = $('#suFname').val();
        var input_lastname = $('#suLname').val();
        var input_email = $('#suEmail').val();
        var input_birthday = $('#suBday').val();


        var validUsername  = false;
        var validPassword  = false;
        var validFirstname = false;
        var validLastname  = false;
        var validEmail     = false;
        var validBirthday  = false;

        /* username rules:
         * - required field
         * - unique
         */
        if(!filled.test(input_username)){
            printToErrorParagraph('suUserErr'," Required Field");
        }
        else if(retrieve(input_username) != null){
            printToErrorParagraph('suUserErr'," Username already taken");
        }
        else{
            validUsername = true;
            printOKToError('suUserErr');
        }

        /* password rules:
         * - required field
         * - must be 8 characters or more
         * - must contain letters
         * - must contain digits
         */
        if(!filled.test(input_password)){
            printToErrorParagraph('suPassErr'," Required Field.");
        }
        else if(!over_n_chars.test(input_password)){
            printToErrorParagraph('suPassErr'," Password must be over " + MIN_PASS_LENGTH +" characters.");
        }
        else if(!contains_letter.test(input_password)){
            printToErrorParagraph('suPassErr'," Password must contain a least 1 letter"); 
        }
        else if(!contains_digit.test(input_password)){
            printToErrorParagraph('suPassErr'," Password must contain a least 1 digit");
        }
        else{
            validPassword = true;
            printOKToError('suPassErr');
        }

        /* first name rules:
         * - required field
         * - must not contain digits
         */
        if(!filled.test(input_firstname)){
            printToErrorParagraph('suFnameErr'," Required Field");
        }
        else if(contains_digit.test(input_firstname)){
            printToErrorParagraph('suFnameErr'," First name cannot contain digits");
        }
        else{
            validFirstname = true;
            printOKToError('suFnameErr');
        }

        /* last name rules:
         * - required field
         * - must not contain digits
         */
        if(!filled.test(input_lastname)){
            printToErrorParagraph('suLnameErr'," Required Field");
        }
        else if(contains_digit.test(input_lastname)){
            printToErrorParagraph('suLnameErr'," Last name cannot contain digits");
        }
        else{
            validLastname = true;
            printOKToError('suLnameErr');
        }

        /* email rules:
         * - required field
         * - must contain @ character
         * - must contain an alphanumeric string preceding the @
         * - must contain a domain (an alphanumeric string) following the @
         * - must contain a suffix (dot followed by letters and dots) following the domain
         */
        if(!filled.test(input_email)){
            printToErrorParagraph('suEmailErr'," Required Field");
        }
        else if(!regexemail.test(input_email)){
            printToErrorParagraph('suEmailErr'," Invalid Email Address");
        }
        else{
            validEmail = true;
            printOKToError('suEmailErr');
        }

        /* birthday rules:
         * - required field
         * - must be a past date
         */
        var currDate = getDateYYYYMMDD();
        if(!filled.test(input_birthday)){
            printToErrorParagraph('suBdayErr'," Required Field");
        }
        else if(currDate < input_birthday){
            printToErrorParagraph('suBdayErr'," Invalid Birthday: entered future date");
        }
        else{
            validBirthday = true;
            printOKToError('suBdayErr');
        }


        if(validUsername && validPassword && validFirstname && validLastname && validEmail && validBirthday){
            $('#submitSignup').prop('disabled',false);
        }
        else{
            $('#submitSignup').prop('disabled',true);
        }
    }

    /* this function is essentially similar to validateSignUp.
     * it defines 2 booleans wo enforce non-emptiness in both login fields.
     * in turn, it enables the login button
     */
    function validateLogin(){
        
        var input_username = $('#loginUser').val();
        var input_password = $('#loginPass').val();

        var valid_username = false;
        var valid_password = false;

        /* username rules:
         * - required field
         */
        if(filled.test(input_username)){
            valid_username = true;
        }

        /* password rules:
         * - required field
         */
        if(filled.test(input_password)){
            valid_password = true;
        }

        if(valid_username && valid_password){
            $('#submitLogin').prop('disabled',false);
        }
        else{
            $('#submitLogin').prop('disabled',true);
        }
    }

    /* this function is called when the signup form is submitted.
     * it pulls the info from the signup form using jQuery and stores it in the session storage
     */
    function registerNewUser(){
        var input_username = $('#suUser').val();
        var input_password = $('#suPass').val();
        var input_firstname = $('#suFname').val();
        var input_lastname = $('#suLname').val();
        var input_email = $('#suEmail').val();
        var input_birthday = $('#suBday').val();

        store(input_username,input_password);
    }

    /* this function is called when the login form is submitted.
     * it pulls the info from the login form using jQuery and compares it to the session storage.
     * if a match is found, the user is transported to the game div.
     * if not, an informative message is shown and 
     */
    function authenticateUser(){

        clearErrorParagraphs('login');

        var login_username = $('#loginUser').val();
        var login_password = $('#loginPass').val();

        if(retrieve(login_username) == null){//wrong username & irrelevane password
            printToErrorParagraph('loginErr'," Sorry, this username doesn't exist.")
        }
        else if(retrieve(login_username) != login_password){//wrong password
            printToErrorParagraph('loginErr'," Sorry, your password doesn't match.")
        }
        else{//successful login
            print("Login Successful!");
            swapDiv("configdiv");
            document.getElementById("usernameGameDiv").innerHTML = "Hello, " + login_username + "!";
        }
    }

    /*given a divname (currently signup or login), this function clears all error paragraphs associated with that div.
     */
    function clearErrorParagraphs(divname){
        if(divname = 'signup'){
            document.getElementById("suUserErr").innerHTML = "";
            document.getElementById("suUserErr").style.color = 'red';
            document.getElementById("suPassErr").innerHTML = "";
            document.getElementById("suPassErr").style.color = 'red';
            document.getElementById("suFnameErr").innerHTML = "";
            document.getElementById("suFnameErr").style.color = 'red';
            document.getElementById("suLnameErr").innerHTML = "";
            document.getElementById("suLnameErr").style.color = 'red';
            document.getElementById("suEmailErr").innerHTML = "";
            document.getElementById("suEmailErr").style.color = 'red';
            document.getElementById("suBdayErr").innerHTML = "";
            document.getElementById("suBdayErr").style.color = 'red';
        }
        if(divname = 'login'){
            document.getElementById("loginErr").innerHTML = "";
            document.getElementById("loginErr").style.color = 'red';
        }
    }

    /* this function receives a paragraph id (where) and a message (what) and writes it.
     * it also instantiates the text's colour to red (because a valid input colours it green).
     */
    function printToErrorParagraph(paragraph_id,message){
        var element = document.getElementById(paragraph_id);
        //var element = $('#' + paragraph_id);
        if(element != null){
            element.innerHTML = message;
        }
    }

    /* this function receives a paragraph id (where) and writes "Ok!" in green to the error paragraph
     */
    function printOKToError(paragraph_id){
        var element = document.getElementById(paragraph_id);
        if(element != null){
            element.style.color = 'green';
            element.innerHTML = " Valid!";
        }
    }

    /* this function returns the current date in the YYYY-MM-DD format.
     */
    function getDateYYYYMMDD(){
        var res = new Date();
        var dd = String(res.getDate()).padStart(2, '0');
        var mm = String(res.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = res.getFullYear();

        res = yyyy + '-' + mm + '-' + dd ;
        
        return res;
    }

    // When the user clicks on the button, open the modal 
    function showAbout(){
        document.getElementById('aboutModal').style.display = "block";
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    function closeAbout(){
        document.getElementById('aboutModal').style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == document.getElementById('aboutModal')) {
            document.getElementById('aboutModal').style.display = "none";
        }
    }

    window.onkeydown = function(event){
        if(event.key == "Escape"){
            document.getElementById('aboutModal').style.display = "none";
        }
    }

    function print(message){
        window.alert("" + message)
    }    
