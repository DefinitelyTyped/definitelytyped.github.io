(function(win:any) {
	win.requestAnimationFrame = (function(){
		return win.requestAnimationFrame       ||
			win.webkitRequestAnimationFrame ||
			win.mozRequestAnimationFrame    ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();
})(window);
