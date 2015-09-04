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
		 * Additional actors that should be drawn.
		 */
		private actors:FXActor[] = [];

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

			var probability = 0;
			setInterval(() => {
				if (Math.random() < probability) {
					this.actors.push(new FXFallingStar(this));
					probability = 0;
				} else {
					probability += 0.01;
				}
			}, 1000);
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

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, width, height);

			for (var star of this.stars) {
				star.update(ctx, delta, sprites, width, height);
			}

			var index = 0;
			var length = this.actors.length;
			while (index < length) {
				if (this.actors[index].update(ctx, delta, width, height)) {
					index += 1;
				} else {
					this.actors.splice(index, 1);
					length -= 1;
				}
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


	/**
	 * Interface for additional fx actors.
	 */
	export interface FXActor
	{
		/**
		 * Animation update callback.
		 */
		update(ctx:CanvasRenderingContext2D, delta:number, width:number, height:number):boolean;
	}


	/**
	 * Displays a falling star.
	 */
	export class FXFallingStar implements FXActor
	{
		/**
		 * The age of the falling star.
		 */
		age:number;

		/**
		 * The max age of the falling star.
		 */
		lifetime:number;

		/**
		 * The current horizontal position.
		 */
		x:number;

		/**
		 * The current vertical position.
		 */
		y:number;

		/**
		 * The current horizontal velocity.
		 */
		velocityX:number;

		/**
		 * The current vertical velocity.
		 */
		velocityY:number;

		/**
		 * The sprite used by the falling star.
		 */
		private static SPRITE:HTMLCanvasElement;



		/**
		 * Create a new FXFallingStar instance.
		 */
		constructor(layer:FXLayer) {
			this.age = 0;
			this.lifetime = 1000 + Math.random() * 1000;

			this.x = Math.random() * layer.width;
			this.y = Math.random() * -layer.height;

			var direction = (0.1 + Math.random() * 0.2) * Math.PI;
			var speed = 700 + Math.random() * 200;
			this.velocityX = Math.cos(direction) * speed;
			this.velocityY = Math.sin(direction) * speed;

			if (!FXFallingStar.SPRITE) {
				var image = document.createElement('img');
				image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAALCAQAAACXQxZfAAAArUlEQVR4AdWSRRaDAAxEcXeXfXuCyq5+tJ57OnV3z8dh+MkD4YMF8e0CSAvEe1QQNzl5AfOXFQo0qJAhXmlFJgpU6HsYRL+YXyhSdJFA2+8GVBMDJizYcBAiWOETb7Hlnri8b1DD/DmJgQGmaGOCIY/6Z2iiRoOUSBckiFESqqlx2IoG+bxERUJFdGISdW+SYAP7v28SkX6+jDz/TaQr8cf+ro2Y2yt53ibCf9cMKX/RB0+qYx0AAAAASUVORK5CYII=';

				var canvas    = FXFallingStar.SPRITE = document.createElement('canvas');
				canvas.width  = image.naturalWidth;
				canvas.height = image.naturalHeight;
				canvas.getContext('2d').drawImage(image, 0, 0);
			}
		}


		/**
		 * Animation update callback.
		 */
		update(ctx:CanvasRenderingContext2D, delta:number, width:number, height:number):boolean {
			this.age += delta;
			var power = this.age / this.lifetime;
			var advance = delta / 1000;

			this.velocityX -= this.velocityX * 0.95 * advance * power;
			this.velocityY += 100 * advance * power;

			var x = this.x + this.velocityX * advance;
			var y = this.y + this.velocityY * advance;

			ctx.globalAlpha = (1 - Math.cos(power * Math.PI * 2)) * 0.5;
			ctx.setTransform(1, 0, 0, 1, x, y);
			ctx.rotate(Math.atan2(this.y - y, this.x - x));
			ctx.drawImage(FXFallingStar.SPRITE, 5, 5);

			if (this.age > this.lifetime) {
				return false;
			} else {
				this.x = x;
				this.y = y;
				return true;
			}
		}
	}
}
