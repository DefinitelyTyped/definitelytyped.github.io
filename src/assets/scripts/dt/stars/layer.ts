namespace dt.stars
{
	/**
	 * Data structure used to store dimensions.
	 */
	export interface Size
	{
		width:number;

		height:number;
	}


	/**
	 * Constructor options for the Layer class.
	 */
	export interface LayerOptions extends Backbone.ViewOptions<any>
	{
		component:Component;

		depth?:number;
	}


	/**
	 * Base class of all layers used by the stars component.
	 */
	export class Layer extends Backbone.NativeView<any>
	{
		/**
		 * The component this layer is attached to.
		 */
		protected component:Component;

		/**
		 * The visual depth of this layer, influences the tilt movement.
		 */
		protected depth:number = 1;

		/**
		 * The current width of this layer.
		 */
		width:number = 0;

		/**
		 * The current height of this layer.
		 */
		height:number = 0;



		/**
		 * Create a new Layer instance.
		 */
		constructor(options:LayerOptions) {
			super(options);

			this.component = options.component;
			this.component.el.appendChild(this.el);

			if (options.depth !== void 0) {
				this.depth = options.depth;
			}
		}


		/**
		 * Set the tilt amount that moves this layer down when the user has scrolled.
		 */
		setTilt(tilt:number) {
			this.el.style[transformStyle] = 'translate(0,' + (tilt * this.depth) + 'px)';
		}


		/**
		 * Set the size of this layer.
		 */
		setSize(width:number, height:number) {
			var size = this.measure({width, height});
			if (this.width != size.width || this.height != size.height) {
				this.width  = width;
				this.height = height;

				this.draw();
			}
		}


		/**
		 * Redraw this layers content.
		 */
		protected draw() { }


		/**
		 * Allow this layer to manipulate the desired dimensions.
		 */
		protected measure(size:Size):Size {
			return size;
		}
	}



	/**
	 * A layer that uses a canvas to display its content.
	 */
	export class CanvasLayer extends Layer
	{
		/**
		 * The rendering context of the underlying canvas object.
		 */
		protected context:CanvasRenderingContext2D;



		/**
		 * Create a new CanvasLayer instance.
		 */
		constructor(options:LayerOptions) {
			super(_.defaults(options || {}, {
				tagName: 'canvas'
			}));

			this.context = this.el.getContext('2d');
		}


		/**
		 * Allow this layer to manipulate the desired dimensions.
		 */
		protected measure(size:Size):Size {
			if (this.width != size.width || this.height != size.height) {
				this.el.width  = size.width;
				this.el.height = size.height;
			}

			return size;
		}


		/**
		 * Load an image and call the callback with the loaded image.
		 */
		static loadImage(src:string, callback:{(image:HTMLImageElement)}) {
			var image = document.createElement('img');
			var onLoaded = () => {
				removeEventListener(image, 'load', onLoaded);
				callback(image);
			};

			addEventListener(image, 'load', onLoaded);
			image.src = src;
		}
	}
}
