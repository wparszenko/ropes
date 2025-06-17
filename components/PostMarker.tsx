import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface PostMarkerProps {
  x: number;
  y: number;
  label: string;
}

export default function PostMarker({ x, y, label }: PostMarkerProps) {
  return (
    <View style={[styles.post, { left: x - 15, top: y - 15 }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  post: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
