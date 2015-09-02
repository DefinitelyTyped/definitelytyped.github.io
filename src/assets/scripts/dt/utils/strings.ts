namespace dt
{
	export function wbrize(value:string) {
		return value.split('/').join('/<wbr>');
	}
}
