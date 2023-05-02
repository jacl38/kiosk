import { ObjectId } from "mongodb";

export default function AddonEdit(props: { id: ObjectId }) {
	return <p>
		{props.id.toHexString()}
	</p>
}