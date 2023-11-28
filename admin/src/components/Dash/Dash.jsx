import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";

function Dash() {
	console.log();
	const socket = useContext(SocketContext);
	const [info, setInfo] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		if (socket) {
			socket.emit("info", null, (response) => {
				setInfo(response);
			});
		}
	}, [socket]);

	function populateTable() {
		return info.map((item) => {
			return (
				<tr key={item.id} id={item.id} onClick={() => navigate(`/device/${item.id}`)}>
					<td>{item.id}</td>
					<td>{item.data.hostname}</td>
					<td>{[item.data.platform, item.data.release].join(" ")}</td>
					<td>{item.data.arch.join(" ")}</td>
					<td>{item.data.type}</td>
				</tr>
			);
		});
	}

	return (
		<table>
			<thead>
				<tr>
					<th>Id</th>
					<th>Hostname</th>
					<th>Platform</th>
					<th>Architecture</th>
					<th>Type</th>
				</tr>
			</thead>
			<tbody>{populateTable()}</tbody>
		</table>
	);
}

export default Dash;
