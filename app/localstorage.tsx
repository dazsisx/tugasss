import { SafeAreaView } from  "react-native-safe-area-context";
import { Text,TextInput,Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';
 
export default function localStorage() {
    const [name, setName] = useState("");
    const [kelas, setKelas] = useState("");
    const [jurusan, setJurusan] = useState("");

    async function saveData() {
        await AsyncStorage.setItem("name",name);
        await AsyncStorage.setItem("kelas",kelas);
        await AsyncStorage.setItem("jurusan",jurusan);

    }
        async function deleteData() {
            await AsyncStorage.removeItem("name");
            await AsyncStorage.removeItem("kelas");
            await AsyncStorage.removeItem("jurusan");
        }
        
        async function getData() {
            const storedName = await AsyncStorage.getItem("name");
            if (storedName !== null) {
                setName(storedName);
            }
            const storedKelas = await AsyncStorage.getItem("kelas");
            if (storedKelas !== null) {
                setKelas(storedKelas);
            }
            const storedJurusan = await AsyncStorage.getItem("jurusan");
            if (storedJurusan !== null) {
                setJurusan(storedJurusan);
            }
        }

        useEffect(() => {
            getData();
        }, []);
        
    return(
        <SafeAreaView>

            <TextInput placeholder="masukkan nama" onChangeText={setName} />
            <Text>Nama : {name}</Text>
            <TextInput placeholder="masukkan kelas" onChangeText={setKelas} />
            <Text>Kelas : {kelas}</Text>
            <TextInput placeholder="masukkan jurusan" onChangeText={setJurusan} />
            <Text>Jurusan : {jurusan}</Text>
            <Button title="simpen data" onPress={saveData}></Button>
            <Button title="hapus data" onPress={deleteData}></Button>
            <Button title="ambil data" onPress={getData}></Button>

        </SafeAreaView>
    )
}