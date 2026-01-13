   const canvas = document.getElementById('universe');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        const stars = [];
        const numStars = 200;

        class Star {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * canvas.width;
                this.size = Math.random() * 2;
                this.speed = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.z -= this.speed;
                if (this.z <= 0) {
                    this.z = canvas.width;
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                }
            }

            draw() {
                if (this.z <= 0) return;
                
                const x = (this.x - canvas.width / 2) * (canvas.width / this.z);
                const y = (this.y - canvas.height / 2) * (canvas.width / this.z);
                const s = this.size * (canvas.width / this.z);

                const centerX = canvas.width / 2 + x;
                const centerY = canvas.height / 2 + y;

                if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(s)) return;

                ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - this.z / canvas.width) + ')';
                ctx.beginPath();
                ctx.arc(centerX, centerY, s, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }

        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(function(star) {
                star.update();
                star.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();

        let quizzes = [];
        let currentQuiz = null;
        let currentCardIndex = null;
        let quizStates = {};

        // Use a relative path so the file can be fetched when served from the same folder.
        // Note: opening the HTML via file:// may block fetch in some browsers — run a local server if needed.
        fetch('quizzes.json')
            .then(function(response) {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(function(data) {
                quizzes = data;
               console.log("coming from the json");
                initializeApp();
            })
            .catch(function(error) {
                console.warn('Could not load quizzes.json — using embedded fallback. Error:', error);
                quizzes = fallbackQuizzes;
                initializeApp();
            });

        // Initialize the app
        initializeApp();

        function initializeApp() {
            quizzes.forEach(function(quiz) {
                quizStates[quiz.id] = { score: 0, answeredCards: [] };
            });

            const quizGrid = document.getElementById('quizGrid');
            quizGrid.innerHTML = '';
            quizzes.forEach(function(quiz) {
                const card = document.createElement('div');
                card.className = 'quiz-card';
                card.setAttribute('data-quiz-id', quiz.id);
                card.innerHTML = '<div class="quiz-card-icon">' + quiz.icon + '</div><h3>' + quiz.title + '</h3><div class="card-count">' + quiz.questions.length + ' Cards</div>';
                card.onclick = function() { startQuiz(quiz.id); };
                quizGrid.appendChild(card);
            });

            const quizPagesContainer = document.getElementById('quizPagesContainer');
            quizPagesContainer.innerHTML = '';
            quizzes.forEach(function(quiz) {
                const quizPage = document.createElement('div');
                quizPage.className = 'quiz-page';
                quizPage.id = 'quiz-' + quiz.id;
                quizPage.innerHTML = '<button class="back-btn">← Back</button><div class="header"><h1>' + quiz.description + '</h1><div class="score">Score: <span class="score-current">0</span> / <span class="score-total">' + quiz.questions.length + '</span></div></div><div class="cards-container"><div class="cards-grid"></div></div><div class="result-screen"><h2>🎉 Quiz Complete!</h2><p>Your Final Score: <span class="final-score"></span></p><button class="btn btn-restart">Try Again</button><button class="btn btn-menu">Back to Menu</button></div>';
                quizPagesContainer.appendChild(quizPage);
                
                const backBtn = quizPage.querySelector('.back-btn');
                const restartBtn = quizPage.querySelector('.btn-restart');
                const menuBtn = quizPage.querySelector('.btn-menu');
                
                backBtn.onclick = goToLanding;
                restartBtn.onclick = function() { restartQuiz(quiz.id); };
                menuBtn.onclick = goToLanding;
            });
        }

        function startQuiz(quizId) {
            currentQuiz = quizzes.find(function(q) { return q.id === quizId; });
            document.getElementById('landingPage').classList.add('hidden');
            const quizPage = document.getElementById('quiz-' + quizId);
            quizPage.classList.add('active');
            initializeQuizCards(quizId);
        }

        function goToLanding() {
            document.querySelectorAll('.quiz-page').forEach(function(page) {
                page.classList.remove('active');
            });
            document.getElementById('landingPage').classList.remove('hidden');
            currentQuiz = null;
        }

        function initializeQuizCards(quizId) {
            const quiz = quizzes.find(function(q) { return q.id === quizId; });
            const quizPage = document.getElementById('quiz-' + quizId);
            const cardsGrid = quizPage.querySelector('.cards-grid');
            const state = quizStates[quizId];
            
            cardsGrid.innerHTML = '';
            quiz.questions.forEach(function(data, index) {
                const card = document.createElement('div');
                card.className = 'deck-card';
                if (state.answeredCards.includes(index)) {
                    card.classList.add('answered');
                }
                card.innerHTML = '<div class="card-icon">' + data.icon + '</div><div class="card-number">' + (index + 1) + '</div>';
                card.onclick = function() { openCard(quizId, index); };
                cardsGrid.appendChild(card);
            });

            quizPage.querySelector('.score-current').textContent = state.score;
        }

        function openCard(quizId, index) {
            const state = quizStates[quizId];
            if (state.answeredCards.includes(index)) return;
            
            currentCardIndex = index;
            const quiz = quizzes.find(function(q) { return q.id === quizId; });
            const data = quiz.questions[index];
            
            const questionText = document.getElementById('questionText');
            const optionsContainer = document.getElementById('optionsContainer');
            const feedback = document.getElementById('feedback');
            const closeBtn = document.getElementById('closeBtn');
            
            questionText.textContent = data.question;
            optionsContainer.innerHTML = '';
            
            data.options.forEach(function(option, i) {
                const optionEl = document.createElement('div');
                optionEl.className = 'option';
                optionEl.textContent = option;
                optionEl.onclick = function() { selectAnswer(quizId, i); };
                optionsContainer.appendChild(optionEl);
            });

            feedback.className = 'feedback';
            closeBtn.className = 'close-btn';
            document.getElementById('questionModal').classList.add('active');
        }

        function selectAnswer(quizId, selectedIndex) {
            const quiz = quizzes.find(function(q) { return q.id === quizId; });
            const data = quiz.questions[currentCardIndex];
            const state = quizStates[quizId];
            const optionsContainer = document.getElementById('optionsContainer');
            const options = optionsContainer.querySelectorAll('.option');
            const feedback = document.getElementById('feedback');
            const closeBtn = document.getElementById('closeBtn');
            
            options.forEach(function(opt) {
                opt.classList.add('disabled');
                opt.onclick = null;
            });

            if (selectedIndex === data.correct) {
                options[selectedIndex].classList.add('correct');
                feedback.className = 'feedback correct show';
                feedback.textContent = '🎉 Correct! Well done!';
                state.score++;
                const quizPage = document.getElementById('quiz-' + quizId);
                quizPage.querySelector('.score-current').textContent = state.score;
            } else {
                options[selectedIndex].classList.add('wrong');
                options[data.correct].classList.add('correct');
                feedback.className = 'feedback wrong show';
                feedback.textContent = '❌ Wrong! The correct answer is: ' + data.options[data.correct];
            }

            closeBtn.classList.add('show');
        }

        document.getElementById('closeBtn').onclick = function() {
            const quizId = currentQuiz.id;
            const state = quizStates[quizId];
            
            document.getElementById('questionModal').classList.remove('active');
            state.answeredCards.push(currentCardIndex);
            
            const quizPage = document.getElementById('quiz-' + quizId);
            const cards = quizPage.querySelectorAll('.deck-card');
            cards[currentCardIndex].classList.add('answered');
            
            if (state.answeredCards.length === currentQuiz.questions.length) {
                setTimeout(function() { showResults(quizId); }, 500);
            }
        };

        function showResults(quizId) {
            const quizPage = document.getElementById('quiz-' + quizId);
            const state = quizStates[quizId];
            const quiz = quizzes.find(function(q) { return q.id === quizId; });
            
            quizPage.querySelector('.cards-container').style.display = 'none';
            const resultScreen = quizPage.querySelector('.result-screen');
            resultScreen.classList.add('show');
            resultScreen.querySelector('.final-score').textContent = state.score + ' / ' + quiz.questions.length;
        }

        function restartQuiz(quizId) {
            const state = quizStates[quizId];
            state.score = 0;
            state.answeredCards = [];
            
            const quizPage = document.getElementById('quiz-' + quizId);
            quizPage.querySelector('.cards-container').style.display = 'block';
            quizPage.querySelector('.result-screen').classList.remove('show');
            
            initializeQuizCards(quizId);

        }

