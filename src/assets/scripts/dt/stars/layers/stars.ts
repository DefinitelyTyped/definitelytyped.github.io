namespace dt.stars
{
	/**
	 * Constructor options for the StarLayer class.
	 */
	export interface StarLayerOptions extends LayerOptions
	{
		spriteSrc:string;

		spriteSize:number;

		density?:number;

		isDust?:boolean;
	}


	/**
	 * A layer rendering a bunch of stars.
	 */
	export class StarLayer extends CanvasLayer
	{
		/**
		 * A list of canvas elements each containing a single star image.
		 */
		private sprites:HTMLCanvasElement[];

		/**
		 * Precalculated positions of the stars to avoid flickering.
		 */
		private positions:number[] = [];

		/**
		 * How many stars should be drawn?
		 */
		private count:number = 0;

		/**
		 * Desired star density, used to calculate the count value on resize.
		 */
		private density:number;

		/**
		 * The offset the stars are drawn with in order to center the around the draw position.
		 */
		private offset:number;

		/**
		 * Should the scale and rotation of the sprites be randomized?
		 */
		private isDust:boolean;

		/**
		 * Gradients used to color the dust sprite.
		 */
		static GRADIENTS = [
			'#ffffff', '#5e90e3',
			'#9281df', '#4a0bb3',
			'#81b4df', '#057c6d'
		];



		/**
		 * Create a new StarLayer instance.
		 */
		constructor(options:StarLayerOptions) {
			super(options);

			this.offset  = options.spriteSize * -0.5;
			this.isDust  = !!options.isDust;
			this.density = options.density ? options.density : 1;

			CanvasLayer.loadImage(options.spriteSrc, (image) => {
				this.setSprite(image, options.spriteSize)
			});
		}


		/**
		 * Redraw this layers content.
		 */
		protected draw() {
			if (!this.sprites) return;

			var ctx        = this.context;
			var count      = this.count;
			var width      = this.width;
			var height     = this.height;
			var positions  = this.positions;
			var sprites    = this.sprites;
			var offset     = this.offset;
			var isDust     = this.isDust;
			var dataLength = isDust ? 5 : 3;

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, width, height);

			for (var index = 0; index < count; index++) {
				var at     = index * dataLength;
				var sprite = sprites[positions[at]];
				var x      = Math.round(width  * positions[at + 1]);
				var y      = Math.round(height * positions[at + 2]);

				ctx.setTransform(1, 0, 0, 1, x, y);
				if (isDust) {
					var scale = positions[at + 3];
					ctx.scale(scale, scale);
					ctx.rotate(positions[at + 4]);
				}

				ctx.drawImage(sprite, offset, offset);
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

				var ctx = canvas.getContext('2d');
				if (this.isDust) {
					var gradient = ctx.createLinearGradient(0, 0, size, size);
					gradient.addColorStop(0.25, StarLayer.GRADIENTS[index * 2]);
					gradient.addColorStop(0.75, StarLayer.GRADIENTS[index * 2 + 1]);

					ctx.fillStyle = gradient;
					ctx.fillRect(0, 0, size, size);
					ctx.globalAlpha = 0.05;
					ctx.globalCompositeOperation = 'destination-in';
					ctx.drawImage(image, 0, -index * size);
				} else {
					ctx.drawImage(image, 0, -index * size);
				}
			}

			this.precalculate();
			this.draw();
		}


		/**
		 * Allow this layer to manipulate the desired dimensions.
		 */
		protected measure(size:Size):Size {
			this.precalculate(size.width, size.height);
			return super.measure(size);
		}


		/**
		 * Precalculate the positions of the stars so thy don't flicker on resize.
		 */
		private precalculate(width:number = this.width, height:number = this.height) {
			if (!this.sprites) return;
			this.count = Math.round((width * height) / 2000 * this.density);

			var positions   = this.positions;
			var isDust      = this.isDust;
			var spriteCount = this.sprites.length;
			var dataLength  = isDust ? 5 : 3;
			var required    = dataLength * this.count;
			var count       = positions.length;

			positions.length = required;
			while (count < required) {
				var spriteIndex = Math.floor(spriteCount * Math.random());
				if (spriteIndex >= spriteCount) {
					spriteIndex = spriteCount - 1;
				}

				positions[count] = spriteIndex;
				positions[count + 1] = Math.random();
				positions[count + 2] = Math.random();

				if (isDust) {
					positions[count + 3] = 1 + Math.random() * 2;
					positions[count + 4] = Math.random() * Math.PI * 2;
				}

				count += dataLength;
			}
		}
	}
}
