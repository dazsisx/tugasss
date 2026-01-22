import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';
import { ScrollView, View, Text } from "react-native";
import { Appbar, Checkbox, List, Surface, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = {
    id: string;
    title: string;
    completed: boolean;
}

export default function todoList() {

    const [todo, setTodo] = useState<Todo[]>([]);
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    async function loadTodo() {
        const storeTodos = await AsyncStorage.getItem("todos")
        if (storeTodos) {
            setTodo(JSON.parse(storeTodos));
        }
        setLoading(false);
    }

    useEffect(() => {
        loadTodo();
    }, []) 

    async function addTodo() {
        const newTodo: Todo = {
            id: Math.random().toString(),
            title: input,
            completed: false
        };
        const updatedTodo = [newTodo, ...todo];
        setTodo(updatedTodo);
        setInput("")

        await AsyncStorage.setItem("todo", JSON.stringify(updatedTodo))
    }

    async function deletedTodo(id: string) {
        const updatedTodo = todo.filter((todo) => todo.id !== id);
        setTodo(updatedTodo)
        await AsyncStorage.setItem("todo", JSON.stringify(updatedTodo))
    }

    async function toggleTodo(id:string) {
        const updatedTodo = todo.map((todo) => 
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        );
        setTodo(updatedTodo);
        await AsyncStorage.setItem("todo", JSON.stringify(updatedTodo));
    }

    function startEdit(todo: Todo) {
        setEditId(todo.id);
        setEditText(todo.title);
    }

    async function saveEdit(id: string) {
        const updatedTodo = todo.map((item) =>
            item.id === id ? { ...item, title: editText } : item
        );

        setTodo(updatedTodo);
        setEditId(null);
        setEditText("");

        await AsyncStorage.setItem("todo", JSON.stringify(updatedTodo));
    }

    return (
        <SafeAreaView>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => {}}/>
                <Appbar.Content title="Todoo"/>
            </Appbar.Header>

            <View style={{padding: 16}}>
                <Surface style={{padding:16, borderRadius:12, elevation:4}}>
                    <TextInput
                        label="todo"
                        onChangeText={setInput}
                        value={input}
                        mode="outlined"
                        right={<TextInput.Icon icon="plus" onPress={addTodo}/>}
                    />
                </Surface>

                <ScrollView style={{ marginTop: 16}}>
                    {todo.map((todo) => (
                        <Surface
                            key={todo.id}
                            style={{ marginBottom: 12, borderRadius: 8 , elevation: 2}}
                        >
                            {editId === todo.id ? (
                                <View style={{ padding: 12 }}>
                                    <TextInput
                                        value={editText}
                                        onChangeText={setEditText}
                                        mode="outlined"
                                    />
                                    <Button onPress={() => saveEdit(todo.id)}>
                                        Save
                                    </Button>
                                </View>
                            ) : (
                                <List.Item
                                    title={() => (
                                        <Text style={{color:"#fff"}}>
                                            {todo.title}
                                        </Text>
                                    )}
                                    left={() => (
                                        <Checkbox
                                            status={todo.completed ? "checked" : "unchecked"}
                                            onPress={() => toggleTodo(todo.id)}
                                        />
                                    )}
                                    right={() => (
                                        <View style={{ flexDirection: "row" }}>
                                            <Button onPress={() => startEdit(todo)}>
                                                Edit
                                            </Button>
                                            <Button onPress={() => deletedTodo(todo.id)}>
                                                Delete
                                            </Button>
                                        </View>
                                    )}
                                />
                            )}
                        </Surface>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
