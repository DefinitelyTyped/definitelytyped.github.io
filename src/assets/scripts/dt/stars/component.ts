namespace dt.stars
{
	/**
	 * Display the skyline panorama on the front page.
	 */
	export class Component extends Backbone.NativeView<any>
	{
		/**
		 * The individual layers the panorama is composed of.
		 */
		private layers:Layer[];

		/**
		 * The animated layer that must be updated in the animation callback.
		 */
		private fx:FXLayer;

		/**
		 * Total width of the display area.
		 */
		private width:number = 0;

		/**
		 * Total height of the display area.
		 */
		private height:number = 0;

		/**
		 * Amount of the current tilt effect, changes as the user scrolls.
		 */
		private tilt:number = 0;

		/**
		 * Timestamp of the last frame update.
		 */
		private lastFrame:number = Date.now();



		/**
		 * Create a new star Component instance.
		 */
		constructor(options?:Backbone.ViewOptions<any>) {
			super(options);

			if (!transformStyle || !Component.isCanvasSupported()) {
				addClass(this.el, 'fallback');
				return;
			}

			this.layers = [
				new StarLayer({ className:'dust',      component:this, depth:1.00, spriteSrc:'/assets/images/skyline-dust.png',     spriteSize:200, density:0.25, isDust:true }),
				new StarLayer({ className:'stars-sm',  component:this, depth:0.90, spriteSrc:'/assets/images/skyline-stars-sm.png', spriteSize:10,  density:1.50 }),
				this.fx = new FXLayer({className:'fx', component:this, depth:0.80, spriteSrc:'/assets/images/skyline-stars-md.png', spriteSize:10,  density:2.00 }),
				new StarLayer({ className:'stars-md',  component:this, depth:0.70, spriteSrc:'/assets/images/skyline-stars-md.png', spriteSize:10,  density:0.50 }),
				new CityLayer({ className:'city-a',    component:this, depth:0.33, spriteSrc:'/assets/images/skyline-city-a.png',   colorFrom:'#0e1928', colorTo:'#1a2e49', offset:300 }),
				new CityLayer({ className:'city-b',    component:this, depth:0.00, spriteSrc:'/assets/images/skyline-city-b.png',   colorFrom:'#172942', colorTo:'#1a2e49' })
			];

			addEventListener(window, 'resize', _.throttle(() => this.onResize(), 100));
			this.onResize();
			this.update();
		}


		/**
		 * Animation frame update callback.
		 */
		update() {
			var now = Date.now();
			this.fx.update(now - this.lastFrame);
			this.lastFrame = now;

			var tilt = Math.min(300, this.height * 0.5);
			tilt *= Math.min(1, scrollTop() / this.height);

			if (this.tilt != tilt) {
				this.tilt = tilt;
				for (var layer of this.layers) {
					layer.setTilt(tilt);
				}
			}

			window.requestAnimationFrame(() => this.update());
		}


		/**
		 * Force the component to run a measure phase.
		 */
		triggerMeasure() {
			for (var layer of this.layers) {
				layer.setSize(this.width, this.height);
			}
		}


		/**
		 * Triggered when the windows resizes.
		 */
		onResize() {
			var width  = this.el.offsetWidth;
			var height = this.el.offsetHeight;
			if (this.width == width && this.height == height) {
				return;
			}

			this.width  = width;
			this.height = height;
			this.triggerMeasure();
		}


		/**
		 * Test whether the canvas element is supported.
		 */
		static isCanvasSupported(){
			var elem = document.createElement('canvas');
			return !!(elem.getContext && elem.getContext('2d'));
		}
	}
}
