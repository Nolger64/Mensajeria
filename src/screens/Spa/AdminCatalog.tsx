import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { apiRequest } from '../../services/apiRequest';
import { formatOrderAmount } from '../../services/orderDisplay';
import type { SpaBranch } from '../../services/spaApi';
import { useOperationStyles } from '../../theme/operationStyles';
import { Action, Choice, Feedback, Field, rowStyle, SpaPage } from './shared';

interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}
interface CatalogBranch extends SpaBranch {
  products: CatalogProduct[];
}

const emptyBranch = { name: '', address: '' };
const emptyProduct = { name: '', description: '', price: '' };

export function AdminCatalog({ token }: { token: string }) {
  const styles = useOperationStyles();
  const [branches, setBranches] = useState<CatalogBranch[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [branch, setBranch] = useState(emptyBranch);
  const [editingBranch, setEditingBranch] = useState<CatalogBranch>();
  const [product, setProduct] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiRequest<CatalogBranch[]>('/api/stores', token);
      setBranches(list);
      setSelectedId((id) => list.some((entry) => entry.id === id) ? id : list[0]?.id || '');
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  const selected = branches.find((entry) => entry.id === selectedId);
  const submit = (path: string, method: string, body: object) =>
    apiRequest(path, token, { method, body: JSON.stringify(body) });

  async function save(action: () => Promise<unknown>, message: string, after?: () => void) {
    if (saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action();
      after?.();
      setNotice(message);
      await reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SpaPage>
      <Feedback error={error} notice={notice} loading={loading} />
      <View style={styles.card}>
        <Text style={styles.heading}>{editingBranch ? 'Editar sede' : 'Nueva sede de Aura Spa'}</Text>
        <Field label="Nombre de la sede" value={branch.name} onChangeText={(name) => setBranch({ ...branch, name })} />
        <Field label="Dirección" value={branch.address} onChangeText={(address) => setBranch({ ...branch, address })} />
        <View style={rowStyle}>
          <Action label="Guardar sede" disabled={saving} onPress={() => save(() => editingBranch
            ? submit(`/api/stores/${editingBranch.id}`, 'PATCH', branch)
            : submit('/api/stores', 'POST', branch), 'Sede guardada.', () => {
            setEditingBranch(undefined);
            setBranch(emptyBranch);
          })} />
          {editingBranch && <Action label="Salir de edición" secondary onPress={() => {
            setEditingBranch(undefined);
            setBranch(emptyBranch);
          }} />}
        </View>
      </View>
      <Text style={styles.title}>Catálogo por sede</Text>
      <View style={rowStyle}>
        {branches.map((entry) => (
          <Choice key={entry.id} selected={entry.id === selectedId} disabled={saving} onPress={() => {
            setSelectedId(entry.id);
            setEditingProduct(undefined);
            setProduct(emptyProduct);
          }}>{entry.name}{entry.active === false ? ' (oculta)' : ''}</Choice>
        ))}
      </View>
      {selected && (
        <>
          <View style={styles.card}>
            <Text style={styles.heading}>{selected.name}</Text>
            <Text style={styles.text}>{selected.address}</Text>
            <View style={rowStyle}>
              <Action label="Editar sede" secondary onPress={() => {
                setEditingBranch(selected);
                setBranch({ name: selected.name, address: selected.address });
              }} />
              <Action label={selected.active === false ? 'Publicar sede' : 'Ocultar sede'} secondary disabled={saving}
                onPress={() => save(() => submit(`/api/stores/${selected.id}`, 'PATCH', {
                  active: selected.active === false,
                }), 'Estado de la sede actualizado.')} />
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>{editingProduct ? 'Editar producto' : 'Nuevo producto del spa'}</Text>
            <Field label="Nombre del producto" value={product.name} onChangeText={(name) => setProduct({ ...product, name })} />
            <Field label="Descripción" value={product.description} onChangeText={(description) => setProduct({ ...product, description })} multiline />
            <Field label="Precio en COP" keyboardType="number-pad" value={product.price}
              onChangeText={(price) => setProduct({ ...product, price })} />
            <View style={rowStyle}>
              <Action label="Guardar producto" disabled={saving} onPress={() => {
                if (!/^\d+$/.test(product.price)) { setError('Ingresa el precio en pesos, sin puntos ni comas.'); return; }
                const fields = { ...product, price: Number(product.price) };
                void save(() => editingProduct
                  ? submit(`/api/stores/${selected.id}/products/${editingProduct.id}`, 'PATCH', fields)
                  : submit(`/api/stores/${selected.id}/products`, 'POST', fields), 'Producto guardado.', () => {
                  setEditingProduct(undefined);
                  setProduct(emptyProduct);
                });
              }} />
              {editingProduct && <Action label="Salir de edición" secondary onPress={() => {
                setEditingProduct(undefined);
                setProduct(emptyProduct);
              }} />}
            </View>
          </View>
          {(selected.products ?? []).map((entry) => (
            <View style={styles.card} key={entry.id}>
              <Text style={styles.heading}>{entry.name} · {formatOrderAmount(entry.price)}</Text>
              <Text style={styles.text}>{entry.available ? 'Disponible' : 'Oculto'}{entry.description ? ` · ${entry.description}` : ''}</Text>
              <View style={rowStyle}>
                <Action label="Editar" secondary onPress={() => {
                  setEditingProduct(entry);
                  setProduct({ name: entry.name, description: entry.description, price: String(entry.price) });
                }} />
                <Action label={entry.available ? 'Ocultar' : 'Publicar'} secondary disabled={saving}
                  onPress={() => save(() => submit(`/api/stores/${selected.id}/products/${entry.id}`, 'PATCH', {
                    available: !entry.available,
                  }), 'Disponibilidad del producto actualizada.')} />
              </View>
            </View>
          ))}
        </>
      )}
    </SpaPage>
  );
}
