import { View, Text  } from '@/src/components/Themed';

import EditScreenInfo from '@/src/components/EditScreenInfo';

export default function TabOneScreen() {
  return (
    <View className="flex flex-1 items-center justify-center">
      <Text className="text-xl font-bold text-red-600">Tab One</Text>
      <View className="my-7 h-[1px] w-[80%] bg-red"/>
      <EditScreenInfo path="src/app/(tabs)/index.tsx" />
    </View>
  );
}
