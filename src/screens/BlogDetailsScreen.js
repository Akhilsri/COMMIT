import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRoute } from "@react-navigation/native";

const BlogDetailsScreen = () => {
  const route = useRoute();
  const { blog } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{blog.title}</Text>
        <Text style={styles.author}>By {blog.author || "Anonymous"} • {blog.date || "Unknown Date"}</Text>

        <View style={styles.separator} />

        <Text style={styles.content}>{blog.content}</Text>
      </ScrollView>

      {/* Footer with like, comment, and share buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="heart-outline" size={22} color="red" />
          <Text style={styles.iconText}>{blog.likes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="comment-outline" size={22} color="gray" />
          <Text style={styles.iconText}>{blog.comments ? blog.comments.length : 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="share-outline" size={22} color="blue" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: "gray",
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  content: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "justify",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#333",
  },
});

export default BlogDetailsScreen;
