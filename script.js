var PRNG;
var cnt = 0;

function pseudorandomMethods(index){
    this.index = index;
    switch(this.index)
    {
        case 0:
            this.name = "LCGs";
            this.allowDuplication = false;
        case 1:
            if(this.index == 1){
                this.allowDuplication = true;
                this.name = "LCGs_allowDuplication";
            }
            //線形合同法
            this.rnd = {
                a: 1664525,
                b: 1013904223,
                m: 2147483647,
                x: 88675123,
                seed: new Date().getTime(),
                init:function(){
                    this.x = this.seed >>> 0;
                    fb.trace("seed = " + this.x);
                },
                next: function(n){
                    this.x = (this.x * this.a + this.b) & this.m;
                    return this.x % n;
                }
            }
            break;
        case 2:
            this.name = "xorshift";
            this.allowDuplication = false;
        case 3:
            if(this.index == 3){
                this.allowDuplication = true;
                this.name = "xorshift_allowDuplication";
            }
            //XorShift
            this.rnd = {
                x: 123456789,
                y: 362436069,
                z: 521288629,
                w: 88675123,
                seed: new Date().getTime(),
                init:function(){
                    this.w = this.seed >>> 0;
                    fb.trace("seed = " + this.w);
                },
                next: function(n){
                    var tempx = this.x ^ (this.x <<11);
                    this.x = tempx;
                    this.y = this.z;
                    this.z = this.w;
                    this.w = (this.w ^(this.w>>>19)^(tempx^(tempx>>>8))) >>> 0;
                    return this.w % n;
                }
            }
            break;
        case 4:
            this.name = "MT";
            this.allowDuplication = false;
        case 5:
            if(this.index == 5){
                this.allowDuplication = true;
                this.name = "MT_allowDuplication";
            }
            //メルセンヌ・ツイスタ
            this.rnd = {
                N: 624,
                M: 397,
                MATRIX_A: 0x9908b0df,
                UPPER_MASK: 0x80000000,
                LOWER_MASK: 0x7fffffff,
                mt: new Array(this.N),
                mti: this.N+1,
                seed: new Date().getTime(),
                init:function(){
                    this.mt[0] = this.seed >>> 0;
                    fb.trace("seed = " + this.mt[0]);
                    for (this.mti=1; this.mti<this.N; this.mti++) {
                        var s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
                        this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
                        this.mt[this.mti] >>>= 0;
                    }
                },
                next: function(n){
                    var y;
                    var mag01 = new Array(0x0, this.MATRIX_A);
                    if (this.mti >= this.N) {
                        var kk;
                        for (kk=0;kk<this.N-this.M;kk++) {
                            y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
                            this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
                        }
                        for (;kk<this.N-1;kk++) {
                            y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
                            this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
                        }
                        y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
                        this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];
                        this.mti = 0;
                    }
                    y = this.mt[this.mti++];
                    y ^= (y >>> 11);
                    y ^= (y << 7) & 0x9d2c5680;
                    y ^= (y << 15) & 0xefc60000;
                    y ^= (y >>> 18);
                    return (y >>> 0) % n;
                }
            }
            break;
        default:
            this.name = "undefined";
            this.rnd = "undefined";
    }
    if(this.rnd != "undefined"){
        this.rnd.init();
    }
}

function setRandonPlaybackQueue(){
    fb.trace("---------------------------------------");
    //---------------------------
    PRNG = new pseudorandomMethods(cnt);
    if(++cnt == 6)
        cnt = 0;
    //---------------------------
    fb.trace("setRandonPlaybackQueue by :" + PRNG.name);

    var dbg = "";

    plman.FlushPlaybackQueue();
    var playlistItemsLength = plman.PlaylistItemCount(plman.PlayingPlaylist);
    if(PRNG.allowDuplication){
        //重複を許す
        for(var i = 0;i < playlistItemsLength * 3;i++){
            var r = PRNG.rnd.next(playlistItemsLength);
            plman.AddPlaylistItemToPlaybackQueue(plman.ActivePlaylist,r);
            dbg += r + " ";
        }
    }else{
        //フィッシャー–イェーツのシャッフル
        //重複を許さない
        var indexs = [];
        for(var i = 0;i < playlistItemsLength;i++){
            indexs.push(i);
        }
        for(var i = 0;i < playlistItemsLength;i++){
            var r = PRNG.rnd.next(indexs.length);
            plman.AddPlaylistItemToPlaybackQueue(plman.ActivePlaylist,indexs[r]);
            dbg += indexs[r] + " ";            
            indexs.splice(r,1);
        }
    }
    fb.trace(dbg);
}

function on_mouse_lbtn_dblclk() {
    setRandonPlaybackQueue();
    plman.PlaybackOrder = 0;
    fb.next();
}
function on_cursor_follow_playback_changed(){
    if(plman.GetPlaybackQueueCount() == 0){
        fb.trace("done");
    }
}

