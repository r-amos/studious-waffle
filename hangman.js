var HangMan = {

	apikey:         "a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
	gameOver: 		false, 
	canvas: 		null,
	context: 		null,
	answer: 		null, 
	word: 			null,
	attempts: 		null,
	checkAttempt: 	null,
	won: 			null, 

	setContext: function(){

		canvas  = document.getElementById("canvas");
		context = canvas.getContext('2d');
	},

	/* Drawing functions */
	drawGallows: function(){
		
		this.setContext();
		context.beginPath();
	    context.moveTo(10,290);
	    context.lineTo(10,280);
	    context.lineTo(100,280);
	    context.lineTo(100,290);
	    context.moveTo(20,290);
	    context.lineTo(20,20);
	    context.lineTo(95,20);
	    context.lineTo(95,27);
	    context.lineTo(30,27);
	    context.lineTo(30,290);
	    context.fill();
	},

	drawNoose: function(){

		context.beginPath();
		context.moveTo(75,27);
		context.lineTo(82,27);
		context.lineTo(82,47);
		context.lineTo(75,47);
		context.fill();
	},

	drawHead: function(){

		context.beginPath();
		context.arc(79, 57, 9, 0, 360);
		context.lineWidth = 3;
		context.stroke();
	},

	drawBody: function(){

		context.beginPath();
		context.moveTo(77,66);
		context.lineTo(77,136);
		context.lineTo(81,136);
		context.lineTo(81,66);
		context.fill();
	},

	drawLeftArm: function(){

		context.save();
		context.rotate(20*Math.PI/180);
		context.fillRect(70,55,35,3);
		context.restore();
	},

	drawRightArm: function(){

		context.save();
		context.rotate(-30*Math.PI/180);
		context.fillRect(24,116,35,3);
		context.restore();
	},

	drawRightLeg: function(){

		context.save();
		context.rotate(30*Math.PI/180);
		context.fillRect(135,75,45,3);
		context.restore();
	},

	drawLeftLeg: function(){

		context.save();
		context.rotate(-30*Math.PI/180);
		context.fillRect(-43,154,45,3);
		context.restore();
	},

	clearCanvas: function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
	},

	/* Set up alphabet buttons */
	initializeAlphabet: function(){

		var alphabetContainer = document.getElementById("alphabet-container");
		var alphabet = 'abcdefghijklmnopqrstuvwxyz';

		for(var i = 0; i < alphabet.length; i++){
			
			var newDiv = document.createElement("div");
			var letter = document.createTextNode(alphabet[i]);
			
			newDiv.className = "letter-button";
			newDiv.appendChild(letter);
			alphabetContainer.appendChild(newDiv);

			var listener = "listener" + alphabet[i];
			this[listener] = this.checkGuess.bind(this);
			newDiv.addEventListener('click',this[listener]);

		}
	},

	removeAlphabet: function(){
		var alphabetContainer = document.getElementById("alphabet-container");
		while (alphabetContainer.firstChild) {
  				alphabetContainer.removeChild(alphabetContainer.firstChild);
			}
	},

	/* Check letter against word */
	checkGuess: function(e){
		if(!this.gameOver){
			var remaining 	= "";
			var match		= false;

			for(var i = 0; i < this.word.length; i++){

				if(e.srcElement.innerText == this.word[i]){
					match = true;
					this.makeVisible(this.word[i]);
				}else{
					remaining = remaining + this.word[i];
					e.target.removeEventListener('click',this[listener]);
				}
			}

			var listener = "listener" + e.srcElement.innerText;
			e.target.removeEventListener('click',this[listener]);
			e.target.classList ="selected";

			this.word = remaining;

			if(this.word.length != 0){

				if(!match){
					this.attempts  = this.attempts+1;
					switch(this.attempts){
						case 1:
						this.drawNoose();
							break;
						case 2:
						this.drawHead();
							break;
						case 3:
						this.drawBody();
							break;
						case 4:
						this.drawLeftArm();
							break;
						case 5:
						this.drawRightArm();
							break;
						case 6:
						this.drawLeftLeg();
							break;
						case 7:
						this.drawRightLeg();
						this.displayMessage('You Lose!');
						this.gameOver = true;
						this.won 	  = false;
							break;
					}
				}		
			} else {
				this.won = true;
				this.displayMessage('You Win!');
				this.gameOver = true;
			}			
		}
	},
	/*Retrieve word with minimum length of 5 using Wordnik API*/
	getWord: function(){
		var that = this;
		var url = "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=" + this.apikey;
		fetch(url)
		.then((response) => response.json())
		.then(function(data){
			that.setWord(data.word);
		})
		.catch(function(error){
			console.log(error);
		});
	},

	/*Set the word for game */
	setWord: function(word){

		this.answer    = word;
		this.word 	   = word.replace('-', '').toLowerCase();

		var currentDiv = document.getElementById("word-container"); 

		if(currentDiv.hasChildNodes()){
			while (currentDiv.firstChild) {
			    currentDiv.removeChild(currentDiv.firstChild);
			}
		}

		for(var i = 0; i < word.length; i++){

			var newDiv = document.createElement("div");
			var space  = document.createElement("div");
			var letter = document.createElement("span");

			newDiv.className = "letter-container";
			space.className  = "spacer";

			if(word[i] !== '-'){
				letter.className = "letter-hidden";
			}

			var newContent = document.createTextNode(word[i]);
			letter.appendChild(newContent);
			newDiv.appendChild(letter);

			currentDiv.appendChild(newDiv);

			if(i < word.length-1){
				currentDiv.appendChild(space);
			}
		}

	},

	/* Take letter and iterate through word, setting class to make it visible on matches */
	makeVisible: function(letter){

		var word = document.getElementById("word-container").childNodes;

		for(var i = 0; i < word.length; i++){
			if(word[i].textContent === letter){
				word[i].firstChild.className = "letter-visible";
			}
		}
	},

	displayMessage: function(message){

		var container   = document.getElementById("message-container");
		var content     = document.getElementById("message-content");

		var resetButton = document.createElement("div");
		var text 		= document.createTextNode("Play Again");

		if(this.won === true){
			content.innerHTML = "<div class=\"message-title\">" + message + "</div>";
		}else{
			content.innerHTML = "<div class=\"message-title\">" + message + "</div><div>The answer was:<div class=\"message-answer\"><em>" + this.answer + "</em></div></div>";
		}
		
		content.className = "alert alert-danger";
	
		resetButton.appendChild(text);
		resetButton.className = "btn btn-success";
		resetButton.addEventListener("click",this.resetGame.bind(this));

		content.appendChild(resetButton);

		container.style.display = "block";

	},

	hideMessage: function(){

		var container  = document.getElementById("message-container");
		container.style.display = "none";

	},

	startGame:function(){

		this.drawGallows();
		this.getWord();
		this.initializeAlphabet();

	},

	resetGame:function(){

		this.gameOver = false;
		this.won = null;
		this.attempts = null;
		this.clearCanvas();
		this.removeAlphabet();
		this.startGame();
		this.hideMessage();

	}

};

HangMan.startGame();