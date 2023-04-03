// 1. Render songs 
// 2. Scroll top 
// 3. Play / pause / seek 
// 4. CD rotate 
// 5. Next / prev
// 6. Random 
// 7. Next / Repeat when ended 
// 8. Active song 
// 9. Scroll active song into view 
// 10. Play song when click


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'August_in_the_sky'

const heading = $('.song-title');
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.play-btn')
const nextBtn = $('#next');
const prevBtn = $('#prev');
const progress = $('#progress')
const shuffle = $('#shuffle')
const repeat = $('#repeat')
const playlist = $('#playList')
 

const app = {
    // danh sách bài hát
    songs: [
        {
            name: "For lovers who hesitate",
            singer: "JANNABI",
            path: "/assets/music/for lovers who hesitate-JANNABI.mp3",
            image: "/assets/img/for lovers who hesitate-JANNABI.jpg"
        },
        {
            name: "How can I love the heartbreak",
            singer: "AKMU",
            path: "/assets/music/How can I love the heartbreak-AKMU.mp3",
            image: "/assets/img/How can I love the heartbreak-AKMU.jpg"
        },
        {
            name: "LET'S NOT FALL IN LOVE",
            singer: "BIGBANG",
            path: "/assets/music/LETS NOT FALL IN LOVE-BIGBANG.mp3",
            image: "/assets/img/LETS NOT FALL IN LOVE-BIGBANG.jpg"
        },
        {
            name: "Me After You-Paul Kim",
            singer: "Paul Kim",
            path: "/assets/music/Me After You-Paul Kim.mp3",
            image: "/assets/img/Me After You-Paul Kim.jpg"
        },
        {
            name: "Only",
            singer: "Lee Hi",
            path: "/assets/music/only-LeeHi.mp3",
            image: "/assets/img/only-LeeHi.jpg"
        },
        {
            name: "Our Beloved Summer",
            singer: "10CM",
            path: "/assets/music/Our Beloved Summer-10CM.mp3",
            image: "/assets/img/Our Beloved Summer-10CM.jpg"
        },
        {
            name: "Some day",
            singer: "Kim Feel",
            path: "/assets/music/Some day-Kim Feel.mp3",
            image: "/assets/img/Some day-Kim Feel.jpg"
        },
        {
            name: "Still Life",
            singer: "BIGBANG",
            path: "/assets/music/Still Life-BIGBANG.mp3",
            image: "/assets/img/Still Life-BIGBANG.jpg"
        },
        {
            name: "Through the Night",
            singer: "IU",
            path: "/assets/music/Through the Night-IU.mp3",
            image: "/assets/img/Through the Night-IU.jpg"
        },
        {
            name: "with you",
            singer: "Uru",
            path: "/assets/music/with you-Uru.mp3",
            image: "/assets/img/with you-Uru.jpg"
        }
    ],

    isShuffling: false,

    isRepeat: false,

    isPlaying: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    playedSongs: [],

    currentIndex: 0,

    // Lưu config như repeat và shuffle vào trong local storage 
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    // gán config từ local storage vào app
    loadConfig: function(){
        this.isRepeat = this.config.isRepeat
        this.isShuffling = this.config.isShuffling
    },

    // render danh sách bài hát
    render: function(){
        const songItems = this.songs.map((item, index) => {
            return`<div class="song-item ${index === this.currentIndex ? 'song-active' : ''}" data-index="${index}">
            <div class="img-container">
                <div class="img" style="background-image: url('${item.image}');"></div>
            </div>
            <div class="item-content">
                <h3 class="song-name">${item.name}</h3>
                <p class="singer">${item.singer}</p>
            </div>
            <div class="option-btn"><i class="ri-more-fill option-icon"></i></div>
        </div>`
        })

        playlist.innerHTML = songItems.join('');
    },

    // Xử lý sự kiện trong app 
    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth
        let playedSongs = []

        // Dùng animate APIs để quay đĩa nhạc khi đang phát nhạc
        const cdTumbling = [
            { transform: "rotate(360deg)"},
        ];

        const cdTiming = {
            duration: 8000,
            iterations: Infinity,
        };

        const cdAnimate = cd.animate(cdTumbling, cdTiming)
        cdAnimate.pause()
        
        // Thu nhỏ đĩa nhạc khi scroll danh sách bài hát
        document.onscroll = function() {
            const scroll = document.documentElement.scrollTop || window.scrollY
            const newWidth = cdWidth - scroll
            cd.style.width = newWidth >= 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth/cdWidth
        }

        // Xử lý click nút tắt mở nhạc 
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause()
                
            }else{
                audio.play()
            }
        }

        // Khi nhạc bắt đầu phát thì đổi nút play thành pause, quay đĩa và active bài hát ở playlist 
        audio.onplaying = function(){
            _this.isPlaying = true
            playBtn.classList.add("ri-pause-circle-fill")
            playBtn.classList.remove("ri-play-circle-fill")
            cdAnimate.play();
            _this.scrollActiveSong()
        }
        // Xử lý sự kiện dừng phát nhạc: Chuyển lại thành nút play và dừng quay đĩa 
        audio.onpause = function(){
            _this.isPlaying = false
            playBtn.classList.remove("ri-pause-circle-fill")
            playBtn.classList.add("ri-play-circle-fill")
            cdAnimate.pause()
        }

        // Lấy ra phần trăm thời lượng đã được phát của bài hát gán cho element progress bar
        audio.ontimeupdate = function(){
            const progressPercent = Math.floor((audio.currentTime * 100) / audio.duration)
            progress.value = progressPercent ? progressPercent : 0;
        }

        // Khi kết thúc audio, active các sự kiện như repeat, shuffle hoặc chuyển qua bài tiếp theo
        audio.onended = function() {
            if(_this.isRepeat){ 
                _this.loadCurrentSong()
                audio.play()
            } else if(_this.isShuffling){
                _this.playRandomSong()
                audio.play()
            }else{
                nextBtn.click();
                audio.play()
            }
        }

        // Xử lý sự kiện tua audio trên progress bả
        progress.onchange = function(){
            seekTime = Math.floor((progress.value / 100) * audio.duration)
            audio.currentTime = seekTime
        }

        // Xử lý nút chuyển bài hát tiếp theo
        nextBtn.onclick = function(){
            if(_this.isShuffling){
                _this.playRandomSong()
            }else{
                _this.playNextSong()
            }

            if(_this.isPlaying){
                audio.play()
            }
        }

        // Xử lý nút quay về bài hát trước đó 
        prevBtn.onclick = function(){
            if(_this.isShuffling){
                _this.playRandomSong()
            }else{
                _this.playPrevSong()
            }
            if(_this.isPlaying){
                audio.play()
            }
        }

        // Xử lý nút xáo trộn bài hát
        shuffle.onclick = function(){
            _this.isShuffling = !_this.isShuffling
            shuffle.classList.toggle('active-btn', _this.isShuffling)
            _this.setConfig('isShuffling', _this.isShuffling)
            console.log(_this.config)
        }

        // xử lý nút lặp lại bài hát
        repeat.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            repeat.classList.toggle('active-btn', _this.isRepeat)
            _this.setConfig('isRepeat', _this.isRepeat)
            console.log(_this.config)
        }

        // Xử lý khi click vào bài hát trong playlist sẽ phát bài hát đó
        playlist.onclick = function(e){
            if(
                e.target.closest('.song-item:not(.song-active)') ||
                !e.target.closest('.option-btn')
            ){
                const songItem = e.target.closest('.song-item')
                if(e.target.closest('.song-item:not(.song-active)')){
                    _this.currentIndex = Number(songItem.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    // scroll bài hát đang phát trong playlist xuống cuối của view 
    scrollActiveSong: function(){
        setTimeout(() => {
            $('.song-item.song-active').scrollIntoView({
                behavior: "smooth",
                block: "end",
            })
        }, 300)
    },

    // phát bài hát được click trong playlist
    playClickedSong: function(index){
        this.currentIndex = index
        this.loadCurrentSong()
        this.render()
    },
    
    // phát ngẫu nhiên một bài hát 
    playRandomSong: function(){
        this.playedSongs.push(this.currentIndex);
        if(this.playedSongs.length == this.songs.length){
            this.playedSongs = []
        }
        let nextSong
        do{
            nextSong = Math.floor(Math.random() * this.songs.length)
        }while(this.playedSongs.includes(nextSong))
        this.currentIndex = nextSong
        console.log(nextSong)
        this.loadCurrentSong()
        this.render()
    },

    // chuyển bài hát tiếp theo
    playNextSong: function(){
        this.currentIndex = this.currentIndex == this.songs.length-1 ? 0 : this.currentIndex + 1
        this.loadCurrentSong()
        this.render()
    },

    // Chuyển về bài trước đó
    playPrevSong: function(){
        this.currentIndex = this.currentIndex == 0 ? this.songs.length-1 : this.currentIndex - 1
        this.loadCurrentSong()
        this.render()
    },

    // định nghĩa property mới để nhận biết bài nào đang được phát
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    // load bài hát theo index 
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`
        audio.src = this.currentSong.path;               
    },

    start: function(){
        this.loadConfig();
        this.render();
        this.handleEvents();
        this.defineProperties();
        this.loadCurrentSong();

        repeat.classList.toggle('active-btn', this.isRepeat)
        shuffle.classList.toggle('active-btn', this.isShuffling)
    },
}

app.start()















