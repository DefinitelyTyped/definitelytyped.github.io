namespace dt.stars
{
	/**
	 * A layer that displays some animated stars.
	 */
	export class FXLayer extends CanvasLayer
	{
		/**
		 * A list of canvas elements each containing a single star image.
		 */
		private sprites:HTMLCanvasElement[];

		/**
		 * A list of all star instances currently available.
		 */
		private stars:FXStar[] = [];

		/**
		 * Desired star density, used to calculate the count value on resize.
		 */
		private density:number = 2;



		/**
		 * Create a new StarLayer instance.
		 */
		constructor(options:StarLayerOptions) {
			super(options);

			CanvasLayer.loadImage(options.spriteSrc, (image) => {
				this.setSprite(image, options.spriteSize)
			});
		}


		/**
		 * Animation update callback.
		 */
		update(delta:number) {
			if (!this.sprites) return;

			var ctx     = this.context;
			var sprites = this.sprites;
			var width   = this.width;
			var height  = this.height;

			ctx.clearRect(0, 0, width, height);

			for (var star of this.stars) {
				star.update(ctx, delta, sprites, width, height);
			}
		}



		/**
		 * Set the image containing the sprites, split them into separate canvas elements.
		 */
		protected setSprite(image:HTMLImageElement, size:number) {
			var count = image.height / size;
			this.sprites = new Array(count);

			for (var index = 0; index < count; index++) {
				var canvas = this.sprites[index] = document.createElement('canvas');
				canvas.width = canvas.height = size;
				canvas.getContext('2d').drawImage(image, 0, -index * size);
			}
		}


		/**
		 * Allow this layer to manipulate the desired dimensions.
		 */
		protected measure(size:Size):Size {
			size.height *= 0.7;
			var count = Math.round((size.width * size.height) / 2000 * this.density);

			while (this.stars.length < count) {
				this.stars.push(new FXStar({parent:this}));
			}

			while (this.stars.length > count) {
				this.stars.pop();
			}

			return super.measure(size);
		}
	}


	/**
	 * Constructor options for the FXStar class.
	 */
	export interface FXStarOptions
	{
		parent:FXLayer;
	}


	/**
	 * Displays a single animated star.
	 */
	export class FXStar
	{
		/**
		 * The fx layer this star belongs to.
		 */
		parent:FXLayer;

		/**
		 * The horizontal position of this star.
		 */
		x:number = 0;

		/**
		 * The vertical position of this star.
		 */
		y:number = 0;

		/**
		 * The index of the sprite this star should be painted with.
		 */
		sprite:number = 0;

		/**
		 * The current age of this star.
		 */
		age:number;

		/**
		 * How long should this star live?
		 */
		lifetime:number;

		/**
		 * Flicker frequency.
		 */
		frequency:number;



		/**
		 * Create a new FXStar instance.
		 */
		constructor(options:FXStarOptions) {
			this.randomize();

			this.parent = options.parent;
			this.age += (Math.abs(this.age) + this.lifetime) * Math.random();
		}


		/**
		 * Animation update callback.
		 */
		update(ctx:CanvasRenderingContext2D, delta:number, sprites:HTMLCanvasElement[], width:number, height:number) {
			var age = this.age += delta;

			if (age > this.lifetime) {
				this.randomize();
			} else if (age > 0) {
				var rel = age / this.lifetime;
				var opacity = 0.5 + ((Math.sin(age / this.frequency) + 1) * 0.25);

				if (rel < 0.25) {
					opacity *= rel * 4;
				} else if (rel > 0.75) {
					opacity *= (1 - rel) * 4;
				}

				ctx.globalAlpha = opacity;
				ctx.drawImage(sprites[this.sprite], Math.floor(this.x * width), Math.floor(this.y * height));
			}
		}


		/**
		 * Randomize this star.
		 */
		randomize() {
			this.x         = Math.random();
			this.y         = Math.random();
			this.sprite    = Math.min(9, Math.floor(Math.random() * 10));
			this.age       = -(1000 + Math.random() * 2000);
			this.frequency = 150 + Math.random() * 300;
			this.lifetime  = 2000 + Math.random() * 4000;
		}
	}
}
