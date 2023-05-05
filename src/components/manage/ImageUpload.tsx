import { tw } from "@/utility/tailwindUtil"
import { ChangeEvent, useState } from "react";

const styles = {
	outerContainer: tw(
		`w-36 h-24`,
		`relative`,
		`rounded-xl`,
		`border-2 border-stone-300 dark:border-gray-500`,
		`flex items-center justify-center`,
		`group`,
		`overflow-hidden`
	),
	label: tw(
		`absolute w-full h-full`,
		`cursor-pointer`,
		`flex items-center justify-center`,
		`font-bold`,
		`opacity-50 group-hover:opacity-100`,
		`[text-shadow:0px_0px_2px_#fff]`,
		`transition-all duration-500`,
	),
	img: tw(
		`max-w-full max-h-full`,
		`w-auto h-auto`,
		`absolute`,
		`group-hover:opacity-50 group-hover:saturate-50 group-hover:blur-sm`,
		`opacity-100 saturate-100 blur-0`,
		`transition-all`,
	)
}

type ImageUploadProps = {
	keyId: string
	onUpload?: (buffer: ArrayBuffer) => void,
	maxBytes?: number
}

/** Ten megabytes (in bytes) */
const tenMegabytes = 10 * 1024 * 1024;

export default function ImageUpload(props: ImageUploadProps) {
	const [image, setImage] = useState<ArrayBuffer>();
	const [url, setUrl] = useState<string>();

	function uploadImage(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];

		// If no file was successfully uploaded
		if(!file) return;

		// If file type doesn't match accepted types (PNG and JPG)
		if(!["image/png", "image/jpg", "image/jpeg"].includes(file.type))
			return alert("Please choose a .jpg or .png image file.");
		
		// If file size is too large
		if(file.size > (props.maxBytes ?? tenMegabytes))
		return alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max file size is 10 MB.`);

		const reader = new FileReader();
		reader.readAsArrayBuffer(file);

		reader.onload = e => {
			const img = e.target?.result as ArrayBuffer;
			const bufferView = new Uint8Array(img);
			const blob = new Blob([bufferView], { type: "image/jpeg" });
			const urlCreator = window.URL || window.webkitURL;
			const imageUrl = urlCreator.createObjectURL(blob);
			setUrl(imageUrl);
			setImage(e.target?.result as ArrayBuffer);
		}
	}
	
	return <div className={styles.outerContainer}>
		<img className={styles.img} src={url}></img>
		<label className={styles.label} htmlFor={props.keyId}>Pick an image</label>
		<input accept="image/png, image/jpeg" onChange={uploadImage} hidden id={props.keyId} type="file" />
	</div>
}