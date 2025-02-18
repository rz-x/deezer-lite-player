window.dzPlayerControl = {
    playPause: () => dzPlayer.control.togglePause(),
    next: () => dzPlayer.control.nextSong(),
    prev: () => dzPlayer.control.prevSong(),
    setVolume: (vol) => dzPlayer.control.setVolume(vol),
    mute: () => dzPlayer.control.mute(!dzPlayer.muted)
};
