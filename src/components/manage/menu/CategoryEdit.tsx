import { ObjectId } from "mongodb";

export default function CategoryEdit(props: { id: ObjectId }) {
	return <p>
		{props.id.toHexString()}
	</p>
}