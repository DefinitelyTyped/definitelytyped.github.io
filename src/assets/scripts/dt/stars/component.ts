namespace dt.stars
{
	export interface Refreshable
	{
		refresh();
	}


	export class Component extends Backbone.NativeView<any> implements Refreshable
	{
		el:HTMLCanvasElement;

		context:CanvasRenderingContext2D;

		width:number;

		height:number;

		lastFrame:number = Date.now();

		layers:Layer[];


		constructor(options?:Backbone.ViewOptions<any>) {
			super(options);

			this.context = this.el.getContext('2d');
			this.layers = [
				new StarGroupLayer({parent:this, depth:1, layers:[
					new StarLayer({sprite:'/assets/images/skyline-dust.png', spriteHeight:400, density:0.25, useRandomTransform:true}),
					new StarLayer({sprite:'/assets/images/skyline-stars-sm.png', spriteHeight:10, density:2})
				]}),
				new StarGroupLayer({parent:this, depth:0.666, layers:[
					new StarLayer({sprite:'/assets/images/skyline-stars-md.png', spriteHeight:10, density:1}),
				]}),
				new CityLayer({parent:this, sprite:'/assets/images/skyline-city-a.png', colorFrom:'#0d1724', colorTo:'#1a2e49', depth:0.333}),
				new CityLayer({parent:this, sprite:'/assets/images/skyline-city-b.png', colorFrom:'#132237', colorTo:'#1a2e49', depth:0})
			];

			addEventListener(window, 'resize', _.throttle(() => this.onResize(), 100));
			this.onResize();
			this.update();
		}


		refresh() {
			var ctx    = this.context;
			var width  = this.width;
			var height = this.height;
			var tilt   = Math.min(1, scrollTop() / height) * Math.min(300, height * 0.5);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, width, height);

			for (var layer of this.layers) {
				layer.draw(ctx, width, height, tilt);
			}
		}


		update() {
			var now = Date.now();
			var delta = this.lastFrame - now;

			for (var layer of this.layers) {
				layer.update(delta);
			}

			this.refresh();
			this.lastFrame = now;

			window.requestAnimationFrame(() => this.update());
		}


		onResize() {
			var width  = (<HTMLElement>this.el.parentNode).offsetWidth;
			var height = (<HTMLElement>this.el.parentNode).offsetHeight;
			if (this.width == width && this.height == height) {
				return;
			}

			this.el.width  = this.width  = width;
			this.el.height = this.height = height;

			for (var layer of this.layers) {
				layer.setSize(width, height);
			}

			this.refresh();
		}
	}


	interface LayerOptions
	{
		parent?:Refreshable;

		depth?:number;
	}


	class Layer
	{
		parent:Refreshable;

		depth:number = 1;


		constructor(options:LayerOptions) {
			this.parent = options.parent;

			if (options.depth !== void 0) {
				this.depth = options.depth;
			}
		}


		update(delta:number) {}


		draw(ctx:CanvasRenderingContext2D, width:number, height:number, tilt:number) { }


		setSize(width:number, height:number) { }
	}


	interface CityLayerOptions extends LayerOptions
	{
		sprite:string;

		colorFrom:string;

		colorTo:string;
	}


	class CityLayer extends Layer
	{
		sprite:HTMLCanvasElement;

		width:number = 0;

		height:number = 0;

		isLoaded:boolean = false;


		constructor(options:CityLayerOptions) {
			super(options);

			this.load(options.sprite, options.colorFrom, options.colorTo);
		}


		draw(ctx:CanvasRenderingContext2D, width:number, height:number, tilt:number) {
			if (!this.isLoaded) {
				return;
			}

			var offset = 0;
			var scale = Math.min(1, width / this.width);
			ctx.setTransform(scale, 0, 0, scale, 0, 0);

			while (offset < width) {
				ctx.drawImage(this.sprite, offset / scale, (height + tilt * this.depth - this.height * scale) / scale);
				offset = Math.floor(offset + this.width);
			}
		}


		load(src:string, colorFrom:string, colorTo:string) {
			var image = document.createElement('img');

			var onLoaded = () => {
				removeEventListener(image, 'load', onLoaded);

				var canvas    = this.sprite = document.createElement('canvas');
				canvas.width  = this.width  = image.width;
				canvas.height = this.height = image.height;

				var ctx = canvas.getContext('2d');
				var gradient = ctx.createLinearGradient(0, 0, 0, this.height);
				gradient.addColorStop(0, colorFrom);
				gradient.addColorStop(1, colorTo);

				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, this.width, this.height);
				ctx.globalCompositeOperation = 'destination-in';
				ctx.drawImage(image, 0, 0);

				this.isLoaded = true;
				this.parent.refresh();
			};

			addEventListener(image, 'load', onLoaded);
			image.src = src;
		}
	}


	interface StarGroupLayerOptions extends LayerOptions
	{
		layers:StarLayer[];
	}


	class StarGroupLayer extends Layer implements Refreshable
	{
		sprite:HTMLCanvasElement;

		context:CanvasRenderingContext2D;

		layers:StarLayer[];

		needsRefresh:boolean = true;


		constructor(options:StarGroupLayerOptions) {
			super(options);

			this.sprite = document.createElement('canvas');
			this.context = this.sprite.getContext('2d');

			_(options.layers).each((layer) => layer.parent = this);
			this.layers = options.layers;
		}


		refresh() {
			this.needsRefresh = true;
			this.parent.refresh();
		}


		draw(ctx:CanvasRenderingContext2D, width:number, height:number, tilt:number) {
			if (this.needsRefresh) {
				this.needsRefresh = false;

				var localCtx = this.context;
				localCtx.setTransform(1, 0, 0, 1, 0, 0);
				localCtx.clearRect(0, 0, width, height);

				for (var layer of this.layers) {
					layer.draw(localCtx, width, height);
				}
			}

			ctx.drawImage(this.sprite, 0, tilt * this.depth);
		}


		setSize(width:number, height:number) {
			this.sprite.width  = width;
			this.sprite.height = height;
			this.needsRefresh  = true;

			for (var layer of this.layers) {
				layer.setSize(width, height);
			}
		}
	}


	interface StarLayerOptions extends LayerOptions
	{
		sprite:string;

		spriteHeight:number;

		density?:number;

		useRandomTransform?:boolean;
	}


	class StarLayer extends Layer
	{
		sprites:HTMLCanvasElement[] = [];

		isLoaded:boolean = false;

		density:number = 1;

		count:number = 0;

		positions:number[] = [];

		shift:number = 0;

		width:number;

		height:number;

		useRandomTransform:boolean;


		constructor(options:StarLayerOptions) {
			super(options);

			this.shift = options.spriteHeight * -0.5;
			this.useRandomTransform = !!options.useRandomTransform;

			if (options.density) {
				this.density = options.density;
			}

			this.load(options.sprite, options.spriteHeight);
		}


		draw(ctx:CanvasRenderingContext2D, width:number, height:number, tilt:number) {
			if (!this.isLoaded) {
				return;
			}

			var positions = this.positions;
			var sprites   = this.sprites;
			var shift     = this.shift;
			var chunkSize = this.useRandomTransform ? 5 : 3;

			for (var index = 0; index < this.count; index++) {
				var n = index * chunkSize;
				var sprite = sprites[positions[n]];
				var x = Math.round(width  * positions[n + 1]);
				var y = Math.round(height * positions[n + 2]);

				ctx.setTransform(1, 0, 0, 1, x, y);
				if (this.useRandomTransform) {
					ctx.scale(positions[n + 3], positions[n + 3]);
					ctx.rotate(positions[n + 4]);
				}

				ctx.drawImage(sprite, shift, shift);
			}

			console.log('PAINTED!');
		}


		setSize(width:number, height:number) {
			this.width = width;
			this.height = height;
			this.updatePositions();
		}


		updatePositions() {
			if (!this.isLoaded) {
				return;
			}

			this.count = Math.round((this.width * this.height) / 2000 * this.density);

			var chunkSize   = this.useRandomTransform ? 5 : 3;
			var positions   = this.positions;
			var count       = this.count * chunkSize;
			var index       = positions.length;
			var spriteCount = this.sprites.length;

			while (index < count) {
				var spriteIndex = Math.floor(spriteCount * Math.random());
				if (spriteIndex >= spriteCount) {
					spriteIndex = spriteCount - 1;
				}

				positions.push(spriteIndex);
				positions.push(Math.random());
				positions.push(Math.random());

				if (this.useRandomTransform) {
					positions.push(0.75 + Math.random() * 1.25);
					positions.push(Math.random() * Math.PI);
				}

				index += chunkSize;
			}
		}


		load(src:string, height:number) {
			var image = document.createElement('img');

			var onStarsLoaded = () => {
				removeEventListener(image, 'load', onStarsLoaded);

				var count = image.height / height;
				var width = image.width;
				for (var index = 0; index < count; index++) {
					var canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					canvas.getContext('2d').drawImage(image, 0, index * -height);

					this.sprites.push(canvas);
				}

				this.isLoaded = true;
				this.updatePositions();
				this.parent.refresh();
			};

			addEventListener(image, 'load', onStarsLoaded);
			image.src = src;
		}
	}
}
