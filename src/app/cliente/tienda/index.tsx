import React from 'react';
import { router } from 'expo-router';
import { StoreCatalogScreen } from '../../../../cliente/src/screens/StoreCatalogScreen';

export default function Screen() {
  return <StoreCatalogScreen onSelectStore={(store) => router.push({
    pathname: '/cliente/tienda/[sede]', params: { sede: store.id },
  })} />;
}
