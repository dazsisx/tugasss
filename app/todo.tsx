import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  completed: boolean;
};

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const stored = await AsyncStorage.getItem("shopping_items");
    if (stored) setItems(JSON.parse(stored));
  }

  async function save(updated: ShoppingItem[]) {
    setItems(updated);
    await AsyncStorage.setItem("shopping_items", JSON.stringify(updated));
  }

  async function addItem() {
    if (!nameInput.trim()) return;
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      quantity: qtyInput.trim() || "1",
      completed: false,
    };
    await save([newItem, ...items]);
    setNameInput("");
    setQtyInput("");
  }

  async function toggleItem(id: string) {
    await save(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  async function deleteItem(id: string) {
    await save(items.filter((item) => item.id !== id));
  }

  function startEdit(item: ShoppingItem) {
    setEditId(item.id);
    setEditName(item.name);
    setEditQty(item.quantity);
  }

  async function saveEdit(id: string) {
    await save(
      items.map((item) =>
        item.id === id
          ? { ...item, name: editName, quantity: editQty }
          : item
      )
    );
    setEditId(null);
    setEditName("");
    setEditQty("");
  }

  const pending = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Belanjaan</Text>
        <Text style={styles.headerSub}>
          {pending.length} item tersisa · {done.length} selesai
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Tambah barang</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputName]}
              placeholder="Nama barang..."
              placeholderTextColor="#bbb"
              value={nameInput}
              onChangeText={setNameInput}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, styles.inputQty]}
              placeholder="Qty"
              placeholderTextColor="#bbb"
              value={qtyInput}
              onChangeText={setQtyInput}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={addItem}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Items */}
        {pending.length > 0 && (
          <View style={styles.section}>
            {pending.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View style={styles.divider} />}
                <ItemRow
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  onEdit={startEdit}
                  isEditing={editId === item.id}
                  editName={editName}
                  editQty={editQty}
                  onEditName={setEditName}
                  onEditQty={setEditQty}
                  onSaveEdit={saveEdit}
                />
              </View>
            ))}
          </View>
        )}

        {/* Done Items */}
        {done.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>✓ Sudah dibeli</Text>
            <View style={[styles.section, styles.sectionDone]}>
              {done.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <ItemRow
                    item={item}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    onEdit={startEdit}
                    isEditing={editId === item.id}
                    editName={editName}
                    editQty={editQty}
                    onEditName={setEditName}
                    onEditQty={setEditQty}
                    onSaveEdit={saveEdit}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {items.length === 0 && (
          <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Belum ada barang</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Item Row Component ────────────────────────────────────────────────────────

type ItemRowProps = {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
  isEditing: boolean;
  editName: string;
  editQty: string;
  onEditName: (v: string) => void;
  onEditQty: (v: string) => void;
  onSaveEdit: (id: string) => void;
};

function ItemRow({
  item,
  onToggle,
  onDelete,
  onEdit,
  isEditing,
  editName,
  editQty,
  onEditName,
  onEditQty,
  onSaveEdit,
}: ItemRowProps) {
  if (isEditing) {
    return (
      <View style={styles.itemEdit}>
        <TextInput
          style={[styles.input, styles.editInputName]}
          value={editName}
          onChangeText={onEditName}
          autoFocus
        />
        <TextInput
          style={[styles.input, styles.editInputQty]}
          value={editQty}
          onChangeText={onEditQty}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSaveEdit(item.id)}
        >
          <Text style={styles.saveBtnText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.itemRow}>
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => onToggle(item.id)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text
          style={[styles.itemName, item.completed && styles.itemNameDone]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.itemQty, item.completed && styles.itemQtyDone]}>
          {item.quantity}x
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.itemActions}>
        {!item.completed && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(item)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onDelete(item.id)}
        >
          <Text style={[styles.actionBtnText, styles.deleteText]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CREAM = "#ffffff";
const PAPER = "#ffffff";
const INK = "#1a1a1a";
const INK_LIGHT = "#888888";
const RULE = "#e8e8e8";
const GREEN = "#4a7c59";
const GREEN_LIGHT = "#e8f2eb";
const RED_SOFT = "#c0392b";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    backgroundColor: PAPER,
  },
  headerTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "700",
    color: INK,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: INK_LIGHT,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // Input Card
  inputCard: {
    backgroundColor: PAPER,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: RULE,
    marginBottom: 4,
  },
  inputLabel: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: INK_LIGHT,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 15,
    color: INK,
  },
  inputName: {
    flex: 1,
  },
  inputQty: {
    width: 64,
    textAlign: "center",
  },
  addBtn: {
    backgroundColor: INK,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Section
  section: {
    backgroundColor: PAPER,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RULE,
    overflow: "hidden",
  },
  sectionDone: {
    opacity: 0.75,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: INK_LIGHT,
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.8,
    paddingHorizontal: 2,
  },
  divider: {
    height: 1,
    backgroundColor: RULE,
    marginHorizontal: 16,
  },

  // Item Row
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 14,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  itemName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    color: INK,
    flex: 1,
  },
  itemNameDone: {
    textDecorationLine: "line-through",
    color: INK_LIGHT,
  },
  itemQty: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: INK_LIGHT,
    minWidth: 28,
  },
  itemQtyDone: {
    color: "#bbb",
  },
  itemActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBtnText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: INK_LIGHT,
  },
  deleteText: {
    color: RED_SOFT,
  },

  // Edit mode
  itemEdit: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  editInputName: {
    flex: 1,
    paddingVertical: 8,
  },
  editInputQty: {
    width: 56,
    textAlign: "center",
    paddingVertical: 8,
  },
  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    fontWeight: "600",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 6,
  },
  emptyText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 17,
    color: INK_LIGHT,
    fontWeight: "600",
  },
  emptySubtext: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    color: "#bbb",
  },
});