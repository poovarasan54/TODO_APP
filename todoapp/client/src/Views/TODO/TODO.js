import { useEffect, useState } from "react";
import Styles from "./TODO.module.css";
import { dummy } from "./dummy";
import axios from "axios";

export function TODO(props) {
	const [newTodo, setNewTodo] = useState("");
	const [todoData, setTodoData] = useState(dummy);
	const [loading, setLoading] = useState(true);
	const [editTodoId, setEditTodoId] = useState(null);
	const [editTodoTitle, setEditTodoTitle] = useState('');
	const [editTodoDescription, setEditTodoDescription] = useState('');

	useEffect(() => {
		const fetchTodo = async () => {
			const apiData = await getTodo();
			setTodoData(apiData);
			setLoading(false);
		};
		fetchTodo();
	}, []);

	const getTodo = async () => {
		const options = {
			method: "GET",
			url: `http://localhost:8000/api/todo`,
			headers: {
				accept: "application/json",
			},
		};
		try {
			const response = await axios.request(options);
			return response.data;
		} catch (error) {
			console.log(error);
			return [];
		}
	};

	const addTodo = () => {
		const options = {
			method: "POST",
			url: `http://localhost:8000/api/todo`,
			headers: {
				accept: "application/json",
			},
			data: {
				title: newTodo,
			},
		};
		axios
			.request(options)
			.then(function (response) {
				console.log(response.data);
				setTodoData((prevData) => [...prevData, response.data.newTodo]);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const deleteTodo = (id) => {
		const options = {
			method: "DELETE",
			url: `http://localhost:8000/api/todo/${id}`,
			headers: {
				accept: "application/json",
			},
		};
		axios
			.request(options)
			.then(function (response) {
				console.log(response.data);
				setTodoData((prevData) =>
					prevData.filter((todo) => todo._id !== id)
				);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const updateTodo = (id) => {
		const todoToUpdate = todoData.find((todo) => todo._id === id);
		const options = {
			method: "PATCH",
			url: `http://localhost:8000/api/todo/${id}`,
			headers: {
				accept: "application/json",
			},
			data: {
				...todoToUpdate,
				done: !todoToUpdate.done,
			},
		};
		axios
			.request(options)
			.then(function (response) {
				console.log(response.data);
				setTodoData((prevData) =>
					prevData.map((todo) =>
						todo._id === id ? response.data : todo
					)
				);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const handleEditTodo = (todo) => {
		setEditTodoId(todo._id);
		setEditTodoTitle(todo.title);
		setEditTodoDescription(todo.description || '');
	};

	const saveEditedTodo = async (id) => {
		try {
			const options = {
				method: "PATCH",
				url: `http://localhost:8000/api/todo/${id}`,
				headers: {
					accept: "application/json",
				},
				data: {
					title: editTodoTitle,
					description: editTodoDescription,
				},
			};
			const response = await axios.request(options);
			console.log(response.data);
			setTodoData((prevData) =>
				prevData.map((todo) =>
					todo._id === id ? response.data : todo
				)
			);
			setEditTodoId(null);
			setEditTodoTitle('');
			setEditTodoDescription('');
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className={Styles.ancestorContainer}>
			<div className={Styles.headerContainer}>
				<h1>Tasks</h1>
				<span>
					<input
						className={Styles.todoInput}
						type="text"
						name="New Todo"
						value={newTodo}
						onChange={(event) => {
							setNewTodo(event.target.value);
						}}
					/>
					<button
						id="addButton"
						name="add"
						className={Styles.addButton}
						onClick={() => {
							addTodo();
							setNewTodo("");
						}}
					>
						+ New Todo
					</button>
				</span>
			</div>
			<div id="todoContainer" className={Styles.todoContainer}>
				{loading ? (
					<p style={{ color: "white" }}>Loading...</p>
				) : todoData.length > 0 ? (
					todoData.map((entry) => (
						<div key={entry._id} className={Styles.todo}>
							{editTodoId === entry._id ? (
								<>
									<input 
										type="text"
										value={editTodoTitle}
										className={Styles.editTodoInput}
										onChange={(e) => setEditTodoTitle(e.target.value)}
									/>
									<textarea className="hello"
										value={editTodoDescription}
										onChange={(e) => setEditTodoDescription(e.target.value)}
									/>
									<button onClick={() => saveEditedTodo(entry._id)}>
										Save
									</button>
								</>
							) : (
								<>
									<span className={Styles.infoContainer}>
										<input
											type="checkbox"
											checked={entry.done}
											onChange={() => updateTodo(entry._id)}
										/>
										{entry.title}
										{/* Render description in a textarea */}
										<textarea
											value={entry.description || ''}
											readOnly
											className={Styles.description}
										/>
									</span>
									<span
										style={{ cursor: "pointer" }}
										onClick={() => handleEditTodo(entry)}
									>
										Edit
									</span>
								</>
							)}
							<span
								style={{ cursor: "pointer" }}
								onClick={() => {
									deleteTodo(entry._id);
								}}
							>
								Delete
							</span>
						</div>
					))
				) : (
					<p className={Styles.noTodoMessage}>
						No tasks available. Please add a new task.
					</p>
				)}
			</div>
		</div>
	);
}
