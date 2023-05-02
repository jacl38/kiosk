import { ObjectId } from "mongodb";

export default function ItemEdit(props: { id: ObjectId }) {
	return <p>
		{props.id.toHexString()}
	</p>
}