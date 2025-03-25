import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar, ActivityIndicator, Alert } from "react-native";
import { fetchBooks } from "../helpers/fetchBooks";
import { useNavigation } from "@react-navigation/native";

const BooksScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const booksData = await fetchBooks();
        setBooks(booksData);
      } catch (error) {
        console.error("Error loading books:", error);
        Alert.alert("Error", "Failed to load books. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const handleReadBook = (book) => {
    // Check if we have a download URL
    if (!book.downloadURL) {
      // If no downloadURL, just pass the book ID
      navigation.navigate("BookReader", { 
        bookId: book.id,
        bookTitle: book.title 
      });
    } else {
      // If we have a downloadURL, pass it directly
      navigation.navigate("BookReader", { 
        pdfUrl: book.downloadURL,
        bookId: book.id,
        bookTitle: book.title 
      });
    }
  };

  const renderBookItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.bookCard, { marginLeft: index % 2 === 0 ? 0 : 8, marginRight: index % 2 === 0 ? 8 : 0 }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("BookDetails", { book: item })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageURL }} 
          style={styles.bookImage}
          // defaultSource={require('../assets/images/book-placeholder.png')} // Add a placeholder image
        />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.rating || "4.5"}</Text>
        </View>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <TouchableOpacity
          style={styles.readButton}
          onPress={() => handleReadBook(item)}
        >
          <Text style={styles.readButtonText}>Read Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Discover</Text>
      <Text style={styles.headerSubtitle}>Find your next great read</Text>
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate("SearchScreen")}
      >
        <View style={styles.searchIconContainer}>
          <Text style={styles.searchIconPlaceholder}>🔍</Text>
        </View>
        <Text style={styles.searchPlaceholder}>Search books, authors...</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && books.length === 0) {
    return (
      <View style={styles.loadingFullScreen}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id || String(Math.random())}
        renderItem={renderBookItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No books found</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => loadBooks()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Existing styles remain the same...
  // Only adding styles that were referenced but not defined above
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIconPlaceholder: {
    fontSize: 16,
  },
  searchPlaceholder: {
    color: "#888",
    fontSize: 15,
  },
  bookCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  bookImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bookInfo: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  readButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  readButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingFullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default BooksScreen;