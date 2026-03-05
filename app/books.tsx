import * as ImagePicker from "expo-image-picker";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, Text, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  Portal,
  TextInput,
} from "react-native-paper";

const db = SQLite.openDatabaseAsync("books.db", {
  useNewConnection: true,  
});

export default function BooksPage() {
  const [visible, setVisible] = useState(false);

  const [formData, setFormData] = useState({
    image: "",
    title: "",
    category: "",
    year: "",
    description: "",
    author: "",
  });

  const [books, setBooks] = useState<any[]>([]);
  const [editBookId, setEditBookId] = useState<number | null>(null);

  async function initDatabase() {
    try {
      (await db).execAsync(
        `CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            year TEXT NOT NULL,
            description TEXT,
            image TEXT
             )`,
      );
    } catch (error) {}
  }

  useEffect(() => {
    initDatabase();
    loadBooks();
  });

  async function loadBooks() {
    try {
      const result = await (await db).getAllAsync("SELECT * FROM books order by id DESC");
      setBooks(result);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat data buku");
      console.log(error);
    }
  }

  async function editBooks() {
    try {
      await (await db).runAsync(
        `UPDATE books SET title = ?, author = ?, category = ?, year = ?, description = ?, image = ? WHERE id = ?`,
        [
          formData.title,
          formData.author,
          formData.category,
          formData.year,
          formData.description,
          formData.image,
          editBookId,
        ]
      );

      const updatedBooks = books.map((book: any) => {
        if (book.id === editBookId) {
          return {
            ...book,
            title: formData.title,
            author: formData.author,
            category: formData.category,
            year: formData.year,
            description: formData.description,
            image: formData.image,
          };
        }
        return book;
      });
      setBooks(updatedBooks);
      setVisible(false);
      setEditBookId(null);
    } catch (error) {
      Alert.alert("Error", "Gagal mengedit buku");
      console.log(error);
    }
  }

  async function addBook() {
    try {
      await (
        await db
      ).runAsync(
        `INSERT INTO books (title, author, category, year, description, image) VALUES
      (?, ?, ?, ?, ?, ?)`,
        [
          formData.title,
          formData.author,
          formData.category,
          formData.year,
          formData.description,
          formData.image,
          editBookId
        ],
      );

      const newBooks = {
        id: Date.now(),
        title: formData.title,
        author: formData.author,
        category: formData.category,
        year: formData.year,
        description: formData.description,
        image: formData.image,
      };
      setBooks([...books, newBooks]);
      setVisible(false);
      setFormData({
        image: "",
        title: "",
        author: "",
        category: "",
        year: "",
        description: "",
      });
    } catch (e) {
      Alert.alert("Error", "Gagal menambahkan buku");
      console.log(e);
    }
  }

  async function deleteBook(id: number) {
    try {
      await (await db).runAsync(`DELETE FROM books WHERE id = ?`, [id]);    
      const updateBooks = books.filter((book: any) => book.id !== id);
      setBooks(updateBooks);
      
    } catch (e) {   
      Alert.alert("Error", "Gagal menghapus buku");
      console.log(e);
    }
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <View>
      <Appbar.Header>
        <Appbar.Content title="Books Page" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            setVisible(true);
          }}
        />
      </Appbar.Header>

      <View
        style={{
          padding: 16,
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <FlatList
          data={books}
          numColumns={2}
          renderItem={({ item }) => (
            <Card style={{ width: "48%", padding: 8, marginBottom: 12 }}>
              <Card.Cover
                source={{
                  uri: item.image,
                }}
              />

              <View style={{ marginTop: 8, marginBottom: 4 }}>
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11, color: "gray" }}>
                  {item.author} - {item.category} - {item.year}
                </Text>

                <Text style={{ marginTop: 6, fontSize: 11, color: "gray" }}>
                  {item.description}
                </Text>
              </View>

              <View>
                <Button mode="contained" onPress={() => {
                  setEditBookId(item.id);
                  setFormData({
                    image: item.image,
                    title: item.title,
                    author: item.author,
                    category: item.category,
                    year: item.year,
                    description: item.description,
                  });
                  setVisible(true);
                }}
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  buttonColor="red"
                  onPress={() => 
                    deleteBook(item.id)}
                >
                  Delete
                </Button>
              </View>
            </Card>
          )}
        />
      </View>
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => {
            setVisible(false);
          }}
        >
          <Dialog.Title>
            {editBookId ? "Edit Buku" : "Tambah Buku"}
          </Dialog.Title>
          <Dialog.Content>
            <View style={{ marginBottom: 12 }}>
              <View style={{ alignItems: "center" }}>
                {formData.image ? (
                  <View
                    style={{
                      width: 120,
                      height: 160,
                      marginBottom: 8,
                      borderRadius: 8,
                      backgroundColor: "gray",
                    }}
                  >
                    <Image
                      source={{ uri: formData.image }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      justifyContent: "center",
                      width: 120,
                      height: 160,
                      marginBottom: 8,
                      borderRadius: 8,
                      backgroundColor: "gray",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      BELUM ADA GAMBAR
                    </Text>
                  </View>
                )}
              </View>
              <Button mode="outlined" onPress={pickImage}>
                Pilih Gambar
              </Button>

              <TextInput
                label="Judul Buku"
                mode="outlined"
                style={{ marginBottom: 12 }}
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                }}
              />

              <TextInput
                label="Penulis"
                mode="outlined"
                style={{ marginBottom: 12 }}
                value={formData.author}
                onChangeText={(text) => {
                  setFormData({ ...formData, author: text });
                }}
              />

              <TextInput
                label="Kategori"
                mode="outlined"
                style={{ marginBottom: 12 }}
                value={formData.category}
                onChangeText={(text) => {
                  setFormData({ ...formData, category: text });
                }}
              />

              <TextInput
                label="Tahun"
                mode="outlined"
                style={{ marginBottom: 12 }}
                value={formData.year}
                onChangeText={(text) => {
                  setFormData({ ...formData, year: text });
                }}
              />

              <TextInput
                label="Deskripsi"
                multiline
                numberOfLines={3}
                mode="outlined"
                style={{ marginBottom: 12 }}
                value={formData.description}
                onChangeText={(text) => {
                  setFormData({ ...formData, description: text });
                }}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Batal</Button>
            <Button 
              onPress={() => {
              if (editBookId) {
                editBooks();  
              } else {
                addBook();
              }
            }}
            >
              {editBookId ? "Update" : "Simpan"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}