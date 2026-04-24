import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, ScrollView, View } from 'react-native';

// Drag-to-reorder list built purely on React Native's built-in
// Animated API + PanResponder — zero native-module dependencies.
//
// Usage:
//   <DraggableList
//     data={items}
//     keyExtractor={(item) => item.id}
//     renderItem={(item, isDragging, onDragStart) => (
//       <MyCard item={item} dragging={isDragging} onDragStart={onDragStart} />
//     )}
//     onReorder={(from, to) => reorder(from, to)}
//   />
//
// Pass `onDragStart` to the drag-handle element inside your item:
//   <Pressable onLongPress={onDragStart} delayLongPress={300}>
//     <GripVertical />
//   </Pressable>

export const DRAG_ITEM_HEIGHT = 72;
export const DRAG_ITEM_GAP = 10;

export interface DraggableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  /** Third arg `onDragStart` must be wired to the drag-handle's onLongPress. */
  renderItem: (item: T, isDragging: boolean, onDragStart: () => void) => React.ReactNode;
  onReorder: (from: number, to: number) => void;
  itemHeight?: number;
  itemGap?: number;
  contentContainerStyle?: object;
}

export function DraggableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  itemHeight = DRAG_ITEM_HEIGHT,
  itemGap = DRAG_ITEM_GAP,
  contentContainerStyle,
}: DraggableListProps<T>) {
  const stride = itemHeight + itemGap;

  // ── JS-thread drag state ────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // Refs for use inside PanResponder callbacks (avoids stale closure values)
  const isDraggingRef = useRef(false);
  const activeIdxRef = useRef(-1);
  const hoverIdxRef = useRef(-1);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // ── Animated values ─────────────────────────────────────────────────────
  // Dragged item follows the finger
  const dragTranslateY = useRef(new Animated.Value(0)).current;

  // Per-item shift animations (springs to ±stride to make room)
  const shiftAnims = useRef(new Map<string, Animated.Value>());
  data.forEach((item) => {
    const key = keyExtractor(item);
    if (!shiftAnims.current.has(key)) {
      shiftAnims.current.set(key, new Animated.Value(0));
    }
  });

  // ── Helpers ─────────────────────────────────────────────────────────────
  const applyShifts = useCallback(
    (from: number, to: number) => {
      dataRef.current.forEach((item, idx) => {
        const key = keyExtractor(item);
        const anim = shiftAnims.current.get(key);
        if (!anim) return;
        let target = 0;
        if (from < to && idx > from && idx <= to) target = -stride;
        else if (from > to && idx >= to && idx < from) target = stride;
        Animated.spring(anim, {
          toValue: target,
          useNativeDriver: true,
          damping: 20,
          stiffness: 250,
          mass: 0.8,
        }).start();
      });
    },
    [keyExtractor, stride],
  );

  const resetAll = useCallback(() => {
    shiftAnims.current.forEach((anim) => anim.setValue(0));
    dragTranslateY.setValue(0);
    isDraggingRef.current = false;
    activeIdxRef.current = -1;
    hoverIdxRef.current = -1;
    setIsDragging(false);
    setActiveIdx(-1);
  }, [dragTranslateY]);

  // Called from the drag handle's onLongPress
  const activateDrag = useCallback(
    (idx: number) => {
      isDraggingRef.current = true;
      activeIdxRef.current = idx;
      hoverIdxRef.current = idx;
      dragTranslateY.setValue(0);
      setIsDragging(true);
      setActiveIdx(idx);
    },
    [dragTranslateY],
  );

  // ── PanResponder on the list container ──────────────────────────────────
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only claim gesture if drag is already active (activated by long press)
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: () => isDraggingRef.current,
        onMoveShouldSetPanResponderCapture: () => isDraggingRef.current,

        onPanResponderGrant: () => {},

        onPanResponderMove: (_, gs) => {
          if (!isDraggingRef.current || activeIdxRef.current < 0) return;
          dragTranslateY.setValue(gs.dy);

          const rawPos = activeIdxRef.current * stride + gs.dy;
          const newHover = Math.max(
            0,
            Math.min(dataRef.current.length - 1, Math.round(rawPos / stride)),
          );
          if (newHover !== hoverIdxRef.current) {
            hoverIdxRef.current = newHover;
            applyShifts(activeIdxRef.current, newHover);
          }
        },

        onPanResponderRelease: (_, gs) => {
          if (!isDraggingRef.current || activeIdxRef.current < 0) return;
          const from = activeIdxRef.current;
          const to = Math.max(
            0,
            Math.min(
              dataRef.current.length - 1,
              Math.round((from * stride + gs.dy) / stride),
            ),
          );
          resetAll();
          if (from !== to) onReorder(from, to);
        },

        onPanResponderTerminate: () => resetAll(),
      }),
    [stride, dragTranslateY, onReorder, applyShifts, resetAll],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ScrollView
      scrollEnabled={!isDragging}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingBottom: 140 }, contentContainerStyle]}
    >
      <View {...panResponder.panHandlers}>
        {data.map((item, idx) => {
          const key = keyExtractor(item);
          const isActive = isDragging && idx === activeIdx;
          const shiftAnim = shiftAnims.current.get(key) ?? new Animated.Value(0);

          return (
            <Animated.View
              key={key}
              style={[
                { marginBottom: itemGap },
                isActive
                  ? {
                      transform: [{ translateY: dragTranslateY }],
                      zIndex: 50,
                      opacity: 0.9,
                      shadowOpacity: 0.2,
                      shadowRadius: 10,
                      elevation: 10,
                    }
                  : { transform: [{ translateY: shiftAnim }] },
              ]}
            >
              {renderItem(item, isActive, () => activateDrag(idx))}
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}
