import type {ReactNode} from 'react';
import {useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoPage = (): ReactNode => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const addTodo = () => {
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id: number) => {
    if (editingText.trim() === '') return;

    setTodos(prev => prev.map(todo =>
      todo.id === id ? {...todo, text: editingText} : todo
    ));
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <Layout
      title="React Todo"
      description="Simple Todo application built with React">
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>📝 React Todo</Heading>

        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="할 일을 입력하세요..."
            className={styles.input}
          />
          <button onClick={addTodo} className={styles.addButton}>
            추가
          </button>
        </div>

        <ul className={styles.todoList}>
          {todos.map(todo => (
            <li key={todo.id} className={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className={styles.checkbox}
              />
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyPress(e, todo.id)}
                    className={styles.editInput}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className={styles.saveButton}
                  >
                    저장
                  </button>
                  <button
                    onClick={cancelEdit}
                    className={styles.cancelButton}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <span className={todo.completed ? styles.completed : ''}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => startEdit(todo.id, todo.text)}
                    className={styles.editButton}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className={styles.deleteButton}
                  >
                    삭제
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className={styles.emptyMessage}>할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
        )}

        <div className={styles.stats}>
          <span>전체: {todos.length}</span>
          <span>완료: {todos.filter(t => t.completed).length}</span>
          <span>미완료: {todos.filter(t => !t.completed).length}</span>
        </div>
      </div>
    </Layout>
  );
};

export default TodoPage;
