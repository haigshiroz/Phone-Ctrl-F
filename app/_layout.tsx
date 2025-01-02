// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }

import { Tabs } from 'expo-router';
import React from 'react';

export default function RootLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
        }}
      />
    </Tabs>
  );
}
