import { trackNoteGenerateMatrixs as initialTrackNoteGenerateMatrixs, noteInterval as initialNoteInterval } from "./maps/idolMap.js"; // Renamed to avoid conflict if loadSong loads the same map initially

// Define SONGS array directly in main.js

const SONGS = [
    {
        id: 'idol',
        title: 'IDOL',
        artist: 'YOASOBI',
        difficulty: 3,
        videoSrc: './video/idol.mp4',
        noteData: './maps/idolMap.js',
        imageSrc: './img/covers/idol.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'yorunikakeru',
        title: '夜に駆ける',
        artist: 'YOASOBI',
        difficulty: 2,
        videoSrc: './video/yorunikakeru.mp4',
        noteData: './maps/yorunikakeruMap.js',
        imageSrc: './img/covers/yorunikakeru.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'gurenge',
        title: '紅蓮華',
        artist: 'LiSA',
        difficulty: 4,
        videoSrc: './video/gurenge.mp4',
        noteData: './maps/gurengeMap.js',
        imageSrc: './img/covers/gurenge.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'unravel',
        title: 'Unravel',
        artist: 'TK from 凛として時雨',
        difficulty: 5,
        videoSrc: './video/unravel.mp4',
        noteData: './maps/unravelMap.js',
        imageSrc: './img/covers/unravel.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'lemon',
        title: 'Lemon',
        artist: '米津玄師',
        difficulty: 2,
        videoSrc: './video/lemon.mp4',
        noteData: './maps/lemonMap.js',
        imageSrc: './img/covers/lemon.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'pretender',
        title: 'Pretender',
        artist: 'Official髭男dism',
        difficulty: 3,
        videoSrc: './video/pretender.mp4',
        noteData: './maps/pretenderMap.js',
        imageSrc: './img/covers/pretender.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'usseewa',
        title: 'うっせぇわ',
        artist: 'Ado',
        difficulty: 4,
        videoSrc: './video/usseewa.mp4',
        noteData: './maps/usseewaMap.js',
        imageSrc: './img/covers/usseewa.jpg' // <-- 新增圖片路徑
    },
    {
        id: 'king',
        title: 'KING',
        artist: 'Kanaria',
        difficulty: 3,
        videoSrc: './video/king.mp4',
        noteData: './maps/kingMap.js',
        imageSrc: './img/covers/king.jpg' // <-- 新增圖片路徑
    },
    // {
    //     id: 'dune', // 假設這是 Ayase 的 Drive
    //     title: 'ドライブ',
    //     artist: 'Ayase / YOASOBI', // 標示清楚
    //     difficulty: 3,
    //     videoSrc: './video/dune.mp4', // 確認影片是否對應
    //     noteData: './maps/duneMap.js',
    //     imageSrc: './img/covers/dune.jpg' // <-- 新增圖片路徑 (假設有這張圖)
    // },
    // Add other songs here if needed, ensure paths are correct
];


window.addEventListener("DOMContentLoaded", () => {

    // Global variables for current map data (will be updated by loadSong)
    let currentTrackNoteGenerateMatrixs = initialTrackNoteGenerateMatrixs;
    let currentNoteInterval = initialNoteInterval;
    let currentLoadedSong = null;
    

    const htmlElement = {
        navbuttonElements: document.querySelectorAll(".nav-btn")
    }

    const gameHtmlElement = {
        scoreElement: document.getElementById("score"),
        comboElement: document.getElementById("combo"),
        comboContainer: document.getElementById("combo-container"),
        gameVideoElement: document.getElementById("game-video"),
        judgementDisplayElement: document.getElementById("judgement-display"),
        trackElements: document.querySelectorAll(".track"),
        hitBoxElement: document.querySelector(".hit-box"),
        hitBoxElements: document.querySelectorAll(".hit-box"),
        accuracyElement: document.getElementById("accuracy"), // Added accuracy element
    };

    const gameSetting = {
        noteColors: ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800"],
        // hitBoxRect: gameHtmlElement.hitBoxElement.getBoundingClientRect(),
        // hitBoxCenterY: (this.hitBoxRect.top + this.hitBoxRect.bottom) / 2,
        // judgementLineY: hitBoxCenterY,

        get hitBoxRect() {
            // Ensure hitBoxElement exists before getting rect
            return gameHtmlElement.hitBoxElement ? gameHtmlElement.hitBoxElement.getBoundingClientRect() : { top: 0, bottom: 0 };
        },
        get judgementLineY() {
            const rect = this.hitBoxRect;
            return (rect.top + rect.bottom) / 2;
        },
    };

    const gameState = {
        score: 0,
        combo: 0,
        noteSpeed: 4, // Default speed, can be changed in settings
        totalHits: 0,
        totalPossibleScore: 0,
        accuracy: 100.00, // Start with 100%
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0,
        maxCombo: 0,
        currentDisplayedScore: 0, // For score animation
        currentDisplayedAccuracy: 100.00, // For accuracy animation
        noteIntervalId: null,
        judgementTimeoutId: null,
        // hitBoxTimeoutId: null, // Not used in the provided code
        comboContainerTimeoutId: null,
        animationFrameId: null, // To control game loop
        gameRunning: false, // Track if game is active
        currentNoteIndex: 0, // Track current note generation index

        resetState() {
            this.score = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.totalHits = 0;
            this.totalPossibleScore = 0;
            this.accuracy = 100.00;
            this.perfect = 0;
            this.great = 0;
            this.good = 0;
            this.miss = 0;
            this.currentDisplayedScore = 0;
            this.currentDisplayedAccuracy = 100.00;
            this.currentNoteIndex = 0; // Reset note index
            // Clear any running timers/intervals
            if (this.noteIntervalId) clearInterval(this.noteIntervalId);
            if (this.judgementTimeoutId) clearTimeout(this.judgementTimeoutId);
            if (this.comboContainerTimeoutId) clearTimeout(this.comboContainerTimeoutId);
            if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
            this.noteIntervalId = null;
            this.judgementTimeoutId = null;
            this.comboContainerTimeoutId = null;
            this.animationFrameId = null;
            this.gameRunning = false;

            // Reset UI elements
            if (gameHtmlElement.scoreElement) gameHtmlElement.scoreElement.textContent = "0";
            if (gameHtmlElement.comboElement) gameHtmlElement.comboElement.textContent = "0";
            if (gameHtmlElement.comboContainer) gameHtmlElement.comboContainer.style.opacity = "0";
            if (gameHtmlElement.accuracyElement) gameHtmlElement.accuracyElement.textContent = "100.00%";
            if (gameHtmlElement.judgementDisplayElement) gameHtmlElement.judgementDisplayElement.style.opacity = "0";

            // Remove existing notes
            document.querySelectorAll('.note').forEach(note => note.remove());
        }
    };

    const JUDGEMENT = {
        PERFECT: { text: "PERFECT", score: 200, timeWindow: 50 }, // Example time window in ms
        GREAT: { text: "GREAT", score: 100, timeWindow: 100 },
        GOOD: { text: "GOOD", score: 50, timeWindow: 150 },
        MISS: { text: "MISS", score: 0, timeWindow: 200 } // Notes outside this are missed
    };

    // Pre-calculate score increments for animation
    const scoreIncrements = {};
    for (const key in JUDGEMENT) {
        scoreIncrements[key] = Math.ceil(JUDGEMENT[key].score / 10) || 1; // Avoid division by zero for MISS
    }


    const JUDGEMENT_HANDLER = new Map([
        [JUDGEMENT.PERFECT, () => handleJudgement(JUDGEMENT.PERFECT)],
        [JUDGEMENT.GREAT, () => handleJudgement(JUDGEMENT.GREAT)],
        [JUDGEMENT.GOOD, () => handleJudgement(JUDGEMENT.GOOD)],
        [JUDGEMENT.MISS, () => handleJudgement(JUDGEMENT.MISS)]
    ]);

    function handleJudgement(judgementType) {
        if (!gameState.gameRunning) return; // Don't process if game ended

        gameState.totalPossibleScore += JUDGEMENT.PERFECT.score; // Always based on perfect score

        if (judgementType !== JUDGEMENT.MISS) {
            gameState.score += judgementType.score;
            gameState.combo++;
            gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
            gameState.totalHits += judgementType.score; // Use actual score for accuracy calculation
            gameState[judgementType.text.toLowerCase()]++; // Increment perfect, great, or good count
            updateScoreDisplay(gameState.score);
            updateComboDisplay(gameState.combo);
        } else {
            gameState.combo = 0;
            gameState.miss++;
            updateComboDisplay(gameState.combo); // Update combo display to show 0
        }

        updateAccuracyDisplay();
        showJudgement(judgementType);
    }


    //顯示判定文字
    function showJudgement(judgement) {
        if (!gameHtmlElement.judgementDisplayElement) return;

        gameHtmlElement.judgementDisplayElement.textContent = judgement.text;
        // Clear previous classes and apply new one
        gameHtmlElement.judgementDisplayElement.className = 'judgement-display'; // Base class
        gameHtmlElement.judgementDisplayElement.classList.add(judgement.text.toLowerCase());

        // Make visible immediately and trigger animation
        gameHtmlElement.judgementDisplayElement.style.opacity = "1";
        gameHtmlElement.judgementDisplayElement.style.transition = 'none'; // Remove transition for instant visibility
        requestAnimationFrame(() => {
            gameHtmlElement.judgementDisplayElement.classList.add("animated");
        });


        // Clear previous timeout
        if (gameState.judgementTimeoutId) clearTimeout(gameState.judgementTimeoutId);

        // Set timeout to fade out
        gameState.judgementTimeoutId = setTimeout(() => {
            if (gameHtmlElement.judgementDisplayElement) {
                gameHtmlElement.judgementDisplayElement.style.transition = "opacity 0.3s linear";
                gameHtmlElement.judgementDisplayElement.style.opacity = "0";
                // Remove animation class after fade out
                setTimeout(() => {
                    if (gameHtmlElement.judgementDisplayElement) gameHtmlElement.judgementDisplayElement.classList.remove("animated");
                }, 300);
            }
        }, 500); // Shorter display time
    };

    //秀出指定畫面
    function showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        // Hide main menu explicitly if showing another page
        if (pageId && document.getElementById('main-menu')) {
            document.getElementById('main-menu').style.display = 'none';
        }

        // Show requested page
        if (pageId) {
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.classList.add('active');
            } else {
                console.error(`Page with id "${pageId}" not found.`);
            }
        }
    }

    function createHitEffect(trackIndex) {
        if (!gameHtmlElement.hitBoxElements || !gameHtmlElement.hitBoxElements[trackIndex]) return;
        const hitBox = gameHtmlElement.hitBoxElements[trackIndex];
        // Ensure class is removed before adding it again to re-trigger animation
        hitBox.classList.remove("hit-effect");
        // Use setTimeout to ensure the class removal is processed before adding it back
        setTimeout(() => {
            hitBox.classList.add('hit-effect');
            // Optionally remove the class after animation duration
            setTimeout(() => hitBox.classList.remove('hit-effect'), 300); // Match animation duration
        }, 0);
    }


    //按鍵對應的軌道 (Configurable later)
    let keyMap = {
        "d": 0,
        "f": 1,
        "j": 2,
        "k": 3
    };

    //根據 trackNoteGenerateMatrixs 創造音符
    function createNote() {
        if (!gameState.gameRunning || !currentTrackNoteGenerateMatrixs) return; // Check if game is running and map is loaded

        const noteIndex = gameState.currentNoteIndex;

        currentTrackNoteGenerateMatrixs.forEach((trackNotes, trackIndex) => {
            // Check if noteIndex is within bounds for this track
            if (noteIndex < trackNotes.length) {
                drawNote(trackNotes[noteIndex], trackIndex);
            }
        });

        // Increment index for next interval only if there are more notes in any track
        const maxLen = currentTrackNoteGenerateMatrixs.reduce((max, track) => Math.max(max, track.length), 0);
        if (noteIndex < maxLen - 1) {
            gameState.currentNoteIndex++;
        } else {
            // Stop creating notes if we've reached the end of the longest track
            if (gameState.noteIntervalId) {
                clearInterval(gameState.noteIntervalId);
                gameState.noteIntervalId = null;
                console.log("Finished generating notes.");
                // Consider triggering end game sequence after a delay
                // checkGameEnd(); // Call a function to check if game should end
            }
        }
    }


    //定義如何畫出 Note
    function drawNote(noteValue, trackIndex) {
        if (noteValue === 1) { // Only draw if noteValue is 1
            const trackElement = gameHtmlElement.trackElements[trackIndex];
            if (!trackElement) return; // Ensure track element exists

            const activeNote = document.createElement("div");
            activeNote.className = "note";
            activeNote.dataset.active = "true"; // Mark as active for processing
            activeNote.dataset.trackIndex = trackIndex.toString();
            activeNote.style.backgroundColor = gameSetting.noteColors[trackIndex % gameSetting.noteColors.length]; // Use modulo for safety
            activeNote.style.transform = `translateY(0px)`; // Start at the top
            activeNote.dataset.y = "0"; // Initial position data

            trackElement.appendChild(activeNote);
        }
    };

    //定義如何更新音符
    function updateNotes() {
        if (!gameState.gameRunning) return;
        const notes = document.querySelectorAll('.note[data-active="true"]');
        const containerHeight = gameHtmlElement.trackElements[0]?.offsetHeight; // Get height of first track

        if (!containerHeight) return; // Stop if track height isn't available

        notes.forEach((note) => {
            const currentY = parseFloat(note.dataset.y) || 0;
            const newY = currentY + gameState.noteSpeed;
            note.dataset.y = newY.toString();
            note.style.transform = `translateY(${newY}px)`;

            const noteBottom = note.getBoundingClientRect().bottom; 
            console.log(`noteBottom:${noteBottom} gameSetting.judgementLineY + JUDGEMENT.MISS.timeWindow + 20: ${gameSetting.judgementLineY + JUDGEMENT.MISS.timeWindow + 20}`)

            // Check if note has passed the judgement line significantly (MISS condition)
            if (noteBottom > gameSetting.judgementLineY + JUDGEMENT.MISS.timeWindow + 20) { // Added buffer
                note.dataset.active = "false"; // Mark as inactive
                note.remove();
                handleJudgement(JUDGEMENT.MISS); // Process miss
            }
        });
    };


    function easeOutQuad(t) {
        return t * (2 - t);
    }

    //更新精準度顯示 with animation
    function updateAccuracyDisplay() {
        if (!gameHtmlElement.accuracyElement) return;

        const targetAccuracy = gameState.totalPossibleScore > 0
            ? (gameState.totalHits / gameState.totalPossibleScore) * 100
            : 100.00; // Default to 100 if no notes processed yet

        gameState.accuracy = targetAccuracy; // Update the raw accuracy value

        const animateAccuracy = () => {
            const diff = gameState.accuracy - gameState.currentDisplayedAccuracy;
            // Stop animation if difference is negligible
            if (Math.abs(diff) < 0.01) {
                gameState.currentDisplayedAccuracy = gameState.accuracy; // Snap to final value
                gameHtmlElement.accuracyElement.textContent = gameState.currentDisplayedAccuracy.toFixed(2) + "%";
                return;
            }

            // Apply easing - adjust the 0.1 for speed
            gameState.currentDisplayedAccuracy += diff * 0.1;
            gameHtmlElement.accuracyElement.textContent = gameState.currentDisplayedAccuracy.toFixed(2) + "%";

            // Continue animation
            requestAnimationFrame(animateAccuracy);
        };

        // Start the animation loop if not already running for accuracy
        requestAnimationFrame(animateAccuracy);
    }


    function handleHit(trackIndex) {
        if (!gameState.gameRunning) return;

        // Find the lowest active note in the specified track
        const notesInTrack = document.querySelectorAll(`.note[data-active="true"][data-track-index="${trackIndex}"]`);
        if (notesInTrack.length === 0) {
            // Optional: Penalize for hitting with no notes? (Depends on game design)
            return;
        }

        // Get the note closest to the hit box (usually the first one in the NodeList as they appear from top)
        const noteToHit = notesInTrack[0]; // Assumes notes are ordered by position implicitly

        const noteRect = noteToHit.getBoundingClientRect();
        const noteCenterY = (noteRect.top + noteRect.bottom) / 2;
        const distance = Math.abs(noteCenterY - gameSetting.judgementLineY);

        let judgement = null;

        // Determine judgement based on distance
        if (distance < JUDGEMENT.PERFECT.timeWindow) judgement = JUDGEMENT.PERFECT;
        else if (distance < JUDGEMENT.GREAT.timeWindow) judgement = JUDGEMENT.GREAT;
        else if (distance < JUDGEMENT.GOOD.timeWindow) judgement = JUDGEMENT.GOOD;
        else if (distance < JUDGEMENT.MISS.timeWindow) judgement = JUDGEMENT.MISS; // Hit but too early/late = MISS

        if (judgement !== null) {
            noteToHit.dataset.active = "false"; // Mark as inactive
            noteToHit.remove();
            createHitEffect(trackIndex); // Trigger visual effect on the hit box

            // Process the judgement (updates score, combo, accuracy, etc.)
            handleJudgement(judgement);
        }
        // If distance is >= MISS timeWindow, the hit is ignored (or potentially penalized if desired)
    };

    // Removed checkAccuracy function as its logic is now inside handleHit

    // Update score display with animation
    function updateScoreDisplay(targetScore) {
        if (!gameHtmlElement.scoreElement) return;

        const animateScore = () => {
            const currentScore = gameState.currentDisplayedScore;
            if (currentScore >= targetScore) {
                gameHtmlElement.scoreElement.textContent = targetScore; // Ensure final value is exact
                return; // Stop animation
            }

            // Calculate increment, ensure at least 1
            const increment = Math.max(1, Math.ceil((targetScore - currentScore) / 15)); // Adjust divisor for speed
            gameState.currentDisplayedScore += increment;
            // Cap at target score
            if (gameState.currentDisplayedScore > targetScore) {
                gameState.currentDisplayedScore = targetScore;
            }
            gameHtmlElement.scoreElement.textContent = gameState.currentDisplayedScore;

            requestAnimationFrame(animateScore); // Continue animation
        };

        requestAnimationFrame(animateScore); // Start animation
    }


    function updateComboDisplay(combo) {
        if (!gameHtmlElement.comboContainer || !gameHtmlElement.comboElement) return;

        const comboContainer = gameHtmlElement.comboContainer;
        const comboElement = gameHtmlElement.comboElement;

        comboElement.textContent = combo;

        // Only show combo container and animate if combo > 0
        if (combo > 1) { // Start showing after combo 1
            comboContainer.style.transition = 'opacity 0.1s linear'; // Quick fade in
            comboContainer.style.opacity = "1";

            // Apply scaling animation to combo number
            comboElement.classList.remove("animated");
            requestAnimationFrame(() => comboElement.classList.add("animated"));

            // Clear previous fade-out timeout and set a new one
            if (gameState.comboContainerTimeoutId) clearTimeout(gameState.comboContainerTimeoutId);
            gameState.comboContainerTimeoutId = setTimeout(() => {
                comboContainer.style.transition = "opacity 0.3s linear";
                comboContainer.style.opacity = "0";
                // Remove animation class after fade out
                setTimeout(() => comboElement.classList.remove("animated"), 300);
            }, 1500); // Keep combo visible for 1.5 seconds
        } else {
            // Hide combo container immediately if combo is 0 or 1
            comboContainer.style.transition = 'none';
            comboContainer.style.opacity = "0";
            comboElement.classList.remove("animated"); // Ensure animation class is removed
            if (gameState.comboContainerTimeoutId) clearTimeout(gameState.comboContainerTimeoutId); // Clear any pending timeout
        }
    }


    //監聽鍵盤按下事件
    document.addEventListener("keydown", (e) => {
        if (!gameState.gameRunning) return; // Ignore if game not running
        const key = e.key.toLowerCase();
        if (keyMap.hasOwnProperty(key) && !e.repeat) { // Check if key is mapped and not a repeat event
            const trackIndex = keyMap[key];
            handleHit(trackIndex); // Call handleHit directly

            gameHtmlElement.trackElements[trackIndex].classList.add("active");
        }
    });


    //監聽鍵盤釋放事件 (Optional: for visual feedback only)
    document.addEventListener("keyup", (e) => {
        const key = e.key.toLowerCase();
        if (keyMap.hasOwnProperty(key)) {
            const trackIndex = keyMap[key];
            if (gameHtmlElement.trackElements && gameHtmlElement.trackElements[trackIndex]) {
                gameHtmlElement.trackElements[trackIndex].classList.remove("active");
            }
        }
    });

    //設定主畫面 StartGame 按鈕按下事件
    document.getElementById('main-start-btn')?.addEventListener('click', function () {
        showPage('song-selection');
        // No need to show game-container here, it's shown after song selection
        if (document.getElementById('main-menu')) {
            document.getElementById('main-menu').style.display = 'none';
        }
    });


    //設定導航列 homeButton 按下事件
    document.getElementById('home-btn')?.addEventListener('click', function () {
        endGame(); // Stop any active game
        showPage(null); // Hide all pages
        if (document.getElementById('main-menu')) {
            document.getElementById('main-menu').style.display = 'flex'; // Show main menu
        }
        if (document.getElementById('game-container')) {
            document.getElementById('game-container').style.display = 'none'; // Hide game area
        }
    });


    //設定導航列 songsButton 按下事件
    document.getElementById('songlist-btn')?.addEventListener('click', function () {
        endGame(); // Stop any active game
        showPage('song-selection');
        if (document.getElementById('game-container')) {
            document.getElementById('game-container').style.display = 'none'; // Hide game area
        }
    });

    //設定導航列 settingsButton 按下事件
    document.getElementById('setting-btn')?.addEventListener('click', function () {
        endGame(); // Stop any active game
        showPage('settings');
        if (document.getElementById('game-container')) {
            document.getElementById('game-container').style.display = 'none'; // Hide game area
        }
    });


    // 導航按鈕點擊動畫處理
    htmlElement.navbuttonElements.forEach(btn => {
        btn.addEventListener('click', function (e) { // Pass event 'e'
            // Ripple effect
            const circle = document.createElement('span');
            circle.classList.add('ripple');

            const rect = btn.getBoundingClientRect();
            const size = Math.max(btn.clientWidth, btn.clientHeight);
            circle.style.width = circle.style.height = size + 'px';
            // Use pageX/pageY if available, fallback to clientX/clientY
            const clickX = e.pageX ?? e.clientX + window.scrollX;
            const clickY = e.pageY ?? e.clientY + window.scrollY;
            circle.style.left = (clickX - rect.left - window.scrollX - size / 2) + 'px';
            circle.style.top = (clickY - rect.top - window.scrollY - size / 2) + 'px';


            btn.appendChild(circle);

            circle.addEventListener('animationend', () => {
                circle.remove();
            });

            // Active state visual (optional, if needed beyond hover/click)
            htmlElement.navbuttonElements.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setTimeout(() => this.classList.remove('active'), 1000); // Remove active class after a bit
        });
    });

    // Removed duplicate ripple effect code block

    function gameLoop() {
        if (!gameState.gameRunning) {
            cancelAnimationFrame(gameState.animationFrameId);
            gameState.animationFrameId = null;
            return;
        }
        updateNotes();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    };

    // 在 initPage 函數中加入結果頁面按鈕的事件監聽器
    function initPage() {
        console.log("Initializing page...");
        initSongSelection();
        initSettingsPage();
        // Hide game container initially
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        } else {
            console.error("Game container not found!");
        }
        // Show main menu initially
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.style.display = 'flex';
        } else {
            console.error("Main menu not found!");
            // Fallback: show song selection if main menu missing
            showPage('song-selection');
        }

        // --- 結果頁面按鈕事件 ---
        const retryBtn = document.getElementById('retry-btn');
        const resultsBackBtn = document.getElementById('results-back-btn');

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                if (currentLoadedSong) {
                    console.log("Retrying song:", currentLoadedSong.title);
                    // 確保結果頁面隱藏
                    showPage(null);
                    // 重新顯示遊戲容器並初始化遊戲（會重置狀態）
                    if (document.getElementById('game-container')) {
                        document.getElementById('game-container').style.display = 'block';
                    }
                    // 不需要再次 loadSong，因為數據已經在 currentLoadedSong 中
                    // 直接調用 initGame 來顯示 PLAY 按鈕
                    initGame();
                } else {
                    console.error("No current song loaded to retry.");
                    // 如果沒有歌曲信息，返回選歌頁面
                    showPage('song-selection');
                    if (document.getElementById('game-container')) {
                        document.getElementById('game-container').style.display = 'none';
                    }
                }
            });
        }

        if (resultsBackBtn) {
            resultsBackBtn.addEventListener('click', () => {
                console.log("Returning to song selection from results.");
                showPage('song-selection'); // 顯示選歌頁
                if (document.getElementById('game-container')) {
                    document.getElementById('game-container').style.display = 'none'; // 確保遊戲容器隱藏
                }
            });
        }
        // --- 結果頁面按鈕事件結束 ---
    }


    function initSongSelection() {
        const songListContainer = document.querySelector('.song-list');
        if (!songListContainer) {
            console.error("Song list container not found!");
            return;
        }

        songListContainer.innerHTML = ''; // Clear existing songs

        SONGS.forEach(song => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';

            // --- 新增：設定背景圖片 ---
            if (song.imageSrc) {
                // 使用 encodeURI 處理可能包含特殊字元的路徑
                songCard.style.backgroundImage = `url('${encodeURI(song.imageSrc)}')`;
            } else {
                // 如果沒有圖片，可以設定一個預設背景色或樣式
                songCard.style.backgroundColor = 'rgba(30, 35, 50, 0.8)';
            }
            // --- 新增結束 ---

            songCard.innerHTML = `
            <div class="song-card-overlay">
                <h3 class="song-title">${song.title}</h3>
                <p class="song-artist">${song.artist}</p>
                <div class="song-difficulty">
                    ${Array(5).fill(0).map((_, i) =>
                `<div class="difficulty-dot ${i < song.difficulty ? 'active' : ''}"></div>`
            ).join('')}
                </div>
            </div>
        `;

            songCard.addEventListener('click', () => {
                console.log(`Selected song: ${song.title}`);
                loadSong(song)
                    .then(() => {
                        // Hide other pages and show game container
                        showPage(null); // Hide song selection/settings
                        if (document.getElementById('game-container')) {
                            document.getElementById('game-container').style.display = 'block';
                        }
                        initGame(); // Show pre-game menu (PLAY button)
                    })
                    .catch(error => {
                        console.error("Failed to load song:", error);
                        alert(`無法載入歌曲資料: ${song.title}`);
                    });
            });

            songListContainer.appendChild(songCard);
        });
    }


    // 在loadSong 函數其中保存歌曲信息
    async function loadSong(song) {
        console.log(`Loading song: ${song.title}, Path: ${song.noteData}`);
        currentLoadedSong = song;

        if (!gameHtmlElement.gameVideoElement) {
            throw new Error("Game video element not found.");
        }
        // Load video
        gameHtmlElement.gameVideoElement.src = song.videoSrc;
        gameHtmlElement.gameVideoElement.load(); // Preload video metadata

        // Load note data dynamically
        try {
            // Ensure the path is relative to the main script location
            const module = await import(song.noteData);
            // Check if the expected exports exist
            if (module.trackNoteGenerateMatrixs && typeof module.noteInterval !== 'undefined') {
                currentTrackNoteGenerateMatrixs = module.trackNoteGenerateMatrixs;
                currentNoteInterval = module.noteInterval;
                console.log(`Loaded note data for ${song.title}, Interval: ${currentNoteInterval}`);
            } else {
                throw new Error(`Map file ${song.noteData} is missing required exports (trackNoteGenerateMatrixs or noteInterval).`);
            }

        } catch (error) {
            console.error(`Error loading note data from ${song.noteData}:`, error);
            // Rethrow the error to be caught by the caller in initSongSelection
            throw new Error(`Failed to load note data module: ${error.message}`);
        }

        // Reset game state *after* successfully loading map data
        // 注意：resetState 現在只在 startGame 調用，這裡不需要
        // gameState.resetState();
    }


    function initGame() {
        // Ensure game container is visible
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) gameContainer.style.display = 'block';

        // Remove any existing start menu
        const existingMenu = document.getElementById('startMenu');
        if (existingMenu) existingMenu.remove();


        // 創建開始選單容器
        const menuContainer = document.createElement('div');
        menuContainer.id = 'startMenu';
        menuContainer.style.position = 'fixed';
        menuContainer.style.top = '0';
        menuContainer.style.left = '0';
        menuContainer.style.width = '100%';
        menuContainer.style.height = '100%';
        menuContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
        menuContainer.style.display = 'flex';
        menuContainer.style.flexDirection = 'column';
        menuContainer.style.justifyContent = 'center';
        menuContainer.style.alignItems = 'center';
        menuContainer.style.zIndex = '1000'; // Ensure it's above game elements
        menuContainer.classList.add("page", "active"); // Treat like a page

        // 創建PLAY按鈕
        const playButton = document.createElement('button');
        playButton.textContent = 'PLAY';
        playButton.style.fontFamily = "'Orbitron', sans-serif";
        playButton.style.padding = '15px 30px';
        playButton.style.fontSize = '24px';
        playButton.style.backgroundColor = '#00ffc8'; // Neon green
        playButton.style.color = '#111'; // Dark text
        playButton.style.border = 'none';
        playButton.style.borderRadius = '5px';
        playButton.style.cursor = 'pointer';
        playButton.style.boxShadow = '0 0 15px #00ffc8'; // Neon glow
        playButton.style.transition = 'transform 0.1s ease';


        playButton.onmouseover = () => playButton.style.backgroundColor = '#33ffd6'; // Lighter neon green
        playButton.onmouseout = () => playButton.style.backgroundColor = '#00ffc8';
        playButton.onmousedown = () => playButton.style.transform = 'scale(0.95)';
        playButton.onmouseup = () => playButton.style.transform = 'scale(1)';

        // 將元素添加到選單容器
        menuContainer.appendChild(playButton);

        // 將選單添加到body
        document.body.appendChild(menuContainer);

        // 添加PLAY按鈕事件監聽器
        playButton.addEventListener('click', function () {
            menuContainer.remove(); // Remove the menu
            showCountdown(3, startGame); // Start countdown, then game
        });
    }

    function initSettingsPage() {
        const volumeSlider = document.getElementById('volume-slider');
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        const keyInputs = document.querySelectorAll('.key-input');
        const hitEffectsToggle = document.getElementById('hit-effects-toggle');
        const judgementToggle = document.getElementById('judgement-toggle');
        const resetSettingsBtn = document.getElementById('reset-settings');
        const saveSettingsBtn = document.getElementById('save-settings');

        // --- Load Settings ---
        const loadSettings = () => {
            const savedVolume = localStorage.getItem('gameVolume') ?? 50;
            const savedSpeed = localStorage.getItem('gameSpeed') ?? 4;
            const savedKeyMap = JSON.parse(localStorage.getItem('gameKeyMap') || JSON.stringify({ d: 0, f: 1, j: 2, k: 3 }));
            const savedHitEffects = localStorage.getItem('gameHitEffects') !== 'false'; // Default true
            const savedJudgement = localStorage.getItem('gameJudgement') !== 'false'; // Default true

            if (volumeSlider) {
                volumeSlider.value = savedVolume;
                // Apply volume immediately (assuming you have a function setVolume)
                // setVolume(savedVolume / 100);
                console.log(`Loaded Volume: ${savedVolume}`);
            }
            if (speedSlider && speedValue) {
                speedSlider.value = savedSpeed;
                speedValue.textContent = savedSpeed;
                gameState.noteSpeed = parseInt(savedSpeed); // Apply speed
                console.log(`Loaded Speed: ${savedSpeed}`);
            }
            if (keyInputs.length > 0) {
                keyMap = savedKeyMap;
                keyInputs.forEach(input => {
                    const track = input.dataset.track;
                    // Find the key for the current track index
                    const keyForTrack = Object.keys(keyMap).find(k => keyMap[k] == track);
                    input.textContent = keyForTrack ? keyForTrack.toUpperCase() : '?';
                });
                console.log('Loaded KeyMap:', keyMap);
            }
            if (hitEffectsToggle) hitEffectsToggle.checked = savedHitEffects;
            if (judgementToggle) judgementToggle.checked = savedJudgement;

            // Apply visual toggles (example - hide elements if toggled off)
            applyVisualSettings(savedHitEffects, savedJudgement);
        };

        // --- Save Settings ---
        const saveSettings = () => {
            if (volumeSlider) localStorage.setItem('gameVolume', volumeSlider.value);
            if (speedSlider) localStorage.setItem('gameSpeed', speedSlider.value);
            localStorage.setItem('gameKeyMap', JSON.stringify(keyMap)); // Save current keyMap
            if (hitEffectsToggle) localStorage.setItem('gameHitEffects', hitEffectsToggle.checked);
            if (judgementToggle) localStorage.setItem('gameJudgement', judgementToggle.checked);

            // Apply settings immediately
            if (speedSlider) gameState.noteSpeed = parseInt(speedSlider.value);
            // if (volumeSlider) setVolume(volumeSlider.value / 100);
            if (hitEffectsToggle && judgementToggle) applyVisualSettings(hitEffectsToggle.checked, judgementToggle.checked);

            console.log('Settings saved!');
            alert('設置已保存！'); // User feedback
        };

        // --- Apply Visual Settings ---
        const applyVisualSettings = (showHitEffects, showJudgement) => {
            // This function needs to be implemented based on how you handle these visuals
            console.log(`Applying visuals: Hit Effects=${showHitEffects}, Judgement=${showJudgement}`);
            // Example: You might add/remove classes or set display styles
            // if (gameHtmlElement.judgementDisplayElement) {
            //     gameHtmlElement.judgementDisplayElement.style.visibility = showJudgement ? 'visible' : 'hidden';
            // }
            // Hit effects might require a flag checked during createHitEffect
            // gameState.showHitEffects = showHitEffects;
        };


        // --- Event Listeners ---
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                // Apply volume dynamically
                // setVolume(e.target.value / 100);
                console.log(`Volume set to: ${e.target.value}%`);
            });
        }

        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                speedValue.textContent = e.target.value;
                gameState.noteSpeed = parseInt(e.target.value); // Apply immediately
                console.log(`Note speed set to: ${e.target.value}`);
            });
        }

        keyInputs.forEach(input => {
            input.addEventListener('click', function () {
                keyInputs.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                this.textContent = "按下按鍵...";
                const currentTrackIndex = parseInt(this.dataset.track);

                const handleKeyDown = (e) => {
                    e.preventDefault(); // Prevent default browser actions for the key
                    const newKey = e.key.toLowerCase();

                    // Check if the key is already assigned to another track
                    const existingTrack = Object.entries(keyMap).find(([k, v]) => k === newKey && v !== currentTrackIndex);
                    if (existingTrack) {
                        alert(`按鍵 '${newKey.toUpperCase()}' 已經分配給軌道 ${existingTrack[1] + 1}！`);
                        // Revert text or keep "按下按鍵..."
                        const keyForCurrentTrack = Object.keys(keyMap).find(k => keyMap[k] === currentTrackIndex);
                        this.textContent = keyForCurrentTrack ? keyForCurrentTrack.toUpperCase() : '?';
                    } else {
                        // Remove old key binding for this track if exists
                        const oldKey = Object.keys(keyMap).find(k => keyMap[k] === currentTrackIndex);
                        if (oldKey) delete keyMap[oldKey];

                        // Add new key binding
                        keyMap[newKey] = currentTrackIndex;
                        this.textContent = newKey.toUpperCase();
                        console.log(`Track ${currentTrackIndex + 1} set to key: ${newKey}`);
                        console.log('Updated KeyMap:', keyMap);
                    }

                    this.classList.remove('active');
                    document.removeEventListener('keydown', handleKeyDown, true); // Use capture phase
                };

                // Use capture phase to potentially catch keys earlier
                document.addEventListener('keydown', handleKeyDown, true);
            });
        });


        // Add listeners for toggles to apply settings visually if needed dynamically
        if (hitEffectsToggle) hitEffectsToggle.addEventListener('change', (e) => applyVisualSettings(e.target.checked, judgementToggle?.checked));
        if (judgementToggle) judgementToggle.addEventListener('change', (e) => applyVisualSettings(hitEffectsToggle?.checked, e.target.checked));


        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                if (confirm('確定要恢復默認設置嗎？當前未保存的更改將丟失。')) {
                    localStorage.removeItem('gameVolume');
                    localStorage.removeItem('gameSpeed');
                    localStorage.removeItem('gameKeyMap');
                    localStorage.removeItem('gameHitEffects');
                    localStorage.removeItem('gameJudgement');
                    loadSettings(); // Reload defaults
                    alert('已恢復默認設置。');
                }
            });
        }

        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }

        // --- Initial Load ---
        loadSettings();
    }


    function showCountdown(seconds, callback) {
        const countdownContainer = document.createElement('div');
        countdownContainer.id = 'countdown';
        // Apply styles similar to judgement display
        countdownContainer.style.fontFamily = "'Orbitron', sans-serif";
        countdownContainer.style.position = 'fixed';
        countdownContainer.style.top = '50%';
        countdownContainer.style.left = '50%';
        countdownContainer.style.transform = 'translate(-50%, -50%)'; // Center it
        countdownContainer.style.zIndex = '1001'; // Above start menu if needed
        countdownContainer.style.fontSize = '150px';
        countdownContainer.style.color = '#00ffc8'; // Neon color
        countdownContainer.style.fontWeight = 'bold';
        countdownContainer.style.textShadow = '0 0 20px #00ffc8'; // Neon glow
        countdownContainer.style.opacity = '0'; // Start transparent for fade-in animation
        countdownContainer.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';


        document.body.appendChild(countdownContainer);

        let current = seconds;

        const updateCountdown = () => {
            countdownContainer.textContent = current;
            // Animation effect for each number
            countdownContainer.style.opacity = '1';
            countdownContainer.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(() => {
                countdownContainer.style.opacity = '0';
                countdownContainer.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 800); // Show number for 0.8s

            if (current <= 0) {
                setTimeout(() => {
                    countdownContainer.remove();
                    callback(); // Call startGame
                }, 200); // Small delay after 0 fades out
            } else {
                current--;
                setTimeout(updateCountdown, 1000); // Update every second
            }
        };

        updateCountdown(); // Start the countdown process
    }


    function startGame() {
        console.log("Attempting to start game..."); // Log start attempt

        gameState.resetState(); // Reset state FIRST
        gameState.gameRunning = true; // THEN set game running flag

        // Ensure video is ready and play it
        if (gameHtmlElement.gameVideoElement) {
            gameHtmlElement.gameVideoElement.currentTime = 0; // Rewind video
            console.log("Playing video...");
            gameHtmlElement.gameVideoElement.play().catch(e => console.error("Video play failed:", e));
            gameHtmlElement.gameVideoElement.style.display = 'block'; // Make sure it's visible
        } else {
            console.error("Game video element not found!");
            gameState.gameRunning = false;
            return;
        }

        // Initialize UI elements
        updateScoreDisplay(0);
        updateComboDisplay(0);
        updateAccuracyDisplay(); // Set initial accuracy display
        console.log("UI Initialized.");


        // Start generating notes based on the loaded interval
        if (currentNoteInterval > 0 && currentTrackNoteGenerateMatrixs && currentTrackNoteGenerateMatrixs.length > 0) {
            console.log(`Setting up note generation interval: ${currentNoteInterval}ms`);
            // Clear any previous interval first
            if (gameState.noteIntervalId) clearInterval(gameState.noteIntervalId);
            // Ensure note index is 0 before starting interval
            gameState.currentNoteIndex = 0;
            gameState.noteIntervalId = setInterval(createNote, currentNoteInterval);
        } else {
            console.error("Cannot start note generation: Invalid interval or map data.", { currentNoteInterval, currentTrackNoteGenerateMatrixs });
            gameState.gameRunning = false;
            return;
        }

        // Start the game loop
        if (gameState.animationFrameId) cancelAnimationFrame(gameState.animationFrameId); // Clear previous loop if any
        console.log("Starting game loop...");
        gameLoop();
    }


    function endGame() {
        // Check if game is running OR if the start menu exists (pre-game state)
        const startMenuExists = !!document.getElementById('startMenu'); // Check if start menu is in DOM
        if (!gameState.gameRunning && !gameState.animationFrameId && !startMenuExists) {
            // Avoid redundant calls if already fully ended/reset
            // console.log("EndGame called, but nothing seems active.");
            return;
        }

        console.log("Ending game or aborting pre-game...");
        gameState.gameRunning = false; // Stop game logic immediately

        // Stop video playback
        if (gameHtmlElement.gameVideoElement) {
            gameHtmlElement.gameVideoElement.pause();
            // Don't hide video or game container here, let page navigation handle it
        }

        // Clear intervals and timeouts
        if (gameState.noteIntervalId) clearInterval(gameState.noteIntervalId);
        if (gameState.judgementTimeoutId) clearTimeout(gameState.judgementTimeoutId);
        if (gameState.comboContainerTimeoutId) clearTimeout(gameState.comboContainerTimeoutId);
        if (gameState.animationFrameId) cancelAnimationFrame(gameState.animationFrameId);
        // Also clear potential countdown timer (add if you store countdown timer globally)
        // if (countdownTimerId) clearInterval(countdownTimerId);


        gameState.noteIntervalId = null;
        gameState.judgementTimeoutId = null;
        gameState.comboContainerTimeoutId = null;
        gameState.animationFrameId = null;
        // countdownTimerId = null;

        // Hide transient game UI elements
        if (gameHtmlElement.comboContainer) gameHtmlElement.comboContainer.style.opacity = "0";
        if (gameHtmlElement.judgementDisplayElement) gameHtmlElement.judgementDisplayElement.style.opacity = "0";

        // Remove any remaining notes from tracks
        document.querySelectorAll('.note').forEach(note => note.remove());

        // *** ADDED: Remove the pre-game start menu overlay if it exists ***
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            console.log("Removing start menu overlay.");
            startMenu.remove();
        }

        // *** ADDED: Remove the countdown overlay if it exists ***
        const countdown = document.getElementById('countdown');
        if (countdown) {
            console.log("Removing countdown overlay.");
            countdown.remove();
        }

        console.log("Game ended/aborted cleanup complete.");
        // Note: gameState is reset at the beginning of startGame now.
    };

    // Ensure the video ending triggers the game end sequence
    gameHtmlElement.gameVideoElement?.addEventListener('ended', () => {
        console.log("Video ended, triggering game end sequence.");
        // Add a small delay to ensure last notes are processed/missed
        setTimeout(() => {
            if (gameState.gameRunning) { // Only process if game was still running
                endGame(); // 先清理遊戲狀態（停止計時器等）
                showResultsPage(); // 然後顯示結果頁面
            }
        }, 500); // Adjust delay as needed
    });

    function calculateGrade(accuracy, score) {
        // 這是一個簡單的評級邏輯範例，你可以根據需要調整
        if (accuracy >= 99.5 && gameState.miss === 0) return { grade: 'S', class: 'grade-s' };
        if (accuracy >= 95) return { grade: 'A', class: 'grade-a' };
        if (accuracy >= 90) return { grade: 'B', class: 'grade-b' };
        if (accuracy >= 80) return { grade: 'C', class: 'grade-c' };
        return { grade: 'F', class: 'grade-f' };
    }


    function showResultsPage() {
        console.log("Showing Results Page...");
        // 獲取結果頁面的元素
        const resultsTitle = document.getElementById('results-song-title');
        const resultsScore = document.getElementById('results-score');
        const resultsAccuracy = document.getElementById('results-accuracy');
        const resultsMaxCombo = document.getElementById('results-max-combo');
        const resultsPerfect = document.getElementById('results-perfect');
        const resultsGreat = document.getElementById('results-great');
        const resultsGood = document.getElementById('results-good');
        const resultsMiss = document.getElementById('results-miss');
        const resultsGrade = document.getElementById('results-grade'); // 評級元素

        // 填充數據
        if (resultsTitle && currentLoadedSong) resultsTitle.textContent = currentLoadedSong.title;
        if (resultsScore) resultsScore.textContent = gameState.score;
        if (resultsAccuracy) resultsAccuracy.textContent = gameState.accuracy.toFixed(2) + "%";
        if (resultsMaxCombo) resultsMaxCombo.textContent = gameState.maxCombo;
        if (resultsPerfect) resultsPerfect.textContent = gameState.perfect;
        if (resultsGreat) resultsGreat.textContent = gameState.great;
        if (resultsGood) resultsGood.textContent = gameState.good;
        if (resultsMiss) resultsMiss.textContent = gameState.miss;

        // 計算並顯示評級
        if (resultsGrade) {
            const gradeInfo = calculateGrade(gameState.accuracy, gameState.score);
            resultsGrade.textContent = gradeInfo.grade;
            resultsGrade.className = `result-value ${gradeInfo.class}`; // 應用 CSS class
        }


        // 隱藏遊戲容器，顯示結果頁面
        if (document.getElementById('game-container')) {
            document.getElementById('game-container').style.display = 'none';
        }
        showPage('results-page');
    }



    // --- Initial Page Load ---
    initPage();
});