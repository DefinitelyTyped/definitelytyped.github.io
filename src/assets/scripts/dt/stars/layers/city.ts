namespace dt.stars
{
	/**
	 * Constructor options for the CityLayer class.
	 */
	export interface CityLayerOptions extends LayerOptions
	{
		spriteSrc:string;

		colorFrom:string;

		colorTo:string;

		offset?:number;
	}


	/**
	 * A layer rendering a city skyline.
	 */
	export class CityLayer extends CanvasLayer
	{
		/**
		 * The loaded skyline image.
		 */
		sprite:HTMLCanvasElement;

		/**
		 * The native width of the loaded sprite.
		 */
		spriteWidth:number = 0;

		/**
		 * The native height of the loaded sprite.
		 */
		spriteHeight:number = 0;

		/**
		 * Move the sprite to the left by this amount.
		 */
		offset:number = 0;

		/**
		 * The current scale factor the skyline is drawn with.
		 */
		scale:number = 1;



		/**
		 * Create a new CityLayer instance.
		 */
		constructor(options:CityLayerOptions) {
			super(options);

			if (options.offset) this.offset = options.offset;

			CanvasLayer.loadImage(options.spriteSrc, (image) => {
				this.setSprite(image, options.colorFrom, options.colorTo);
			});
		}


		/**
		 * Redraw this layers content.
		 */
		protected draw() {
			if (!this.sprite) return;

			var ctx    = this.context;
			var scale  = this.scale;
			var offset = -Math.abs(this.offset * scale);

			ctx.clearRect(0, 0, this.width, this.height);
			ctx.setTransform(scale, 0, 0, scale, 0, 0);

			while (offset < this.width) {
				ctx.drawImage(this.sprite, offset / scale, 0);
				offset = Math.floor(offset + this.spriteWidth * scale);
			}
		}


		/**
		 * Allow this layer to manipulate the desired dimensions.
		 */
		protected measure(size:Size):Size {
			var scale = this.scale = Math.min(1, size.width / this.spriteWidth);
			size.height = Math.floor(this.spriteHeight * scale);

			return super.measure(size);
		}


		/**
		 * Combine the loaded skyline with an gradient and store it in a new canvas.
		 */
		private setSprite(image:HTMLImageElement, colorFrom:string, colorTo:string) {
			var canvas = this.sprite = document.createElement('canvas');
			var width  = canvas.width  = this.spriteWidth  = image.naturalWidth;
			var height = canvas.height = this.spriteHeight = image.naturalHeight;
			var ctx    = canvas.getContext('2d');

			var gradient = ctx.createLinearGradient(0, 0, 0, height);
			gradient.addColorStop(0, colorFrom);
			gradient.addColorStop(1, colorTo);

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, width, height);
			ctx.globalCompositeOperation = 'destination-in';
			ctx.drawImage(image, 0, 0);

			this.component.triggerMeasure();
		}
	}
}
