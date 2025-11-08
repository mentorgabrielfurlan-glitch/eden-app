import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initializeFirebase } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Invoice } from '../types/models';

const PaymentsScreen: React.FC = () => {
  const { user } = useAuth();
  const { firestore } = initializeFirebase();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user?.uid) return;
      const snapshot = await getDocs(query(collection(firestore, 'invoices'), where('userId', '==', user.uid)));
      const results = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as any;
        return {
          id: docSnapshot.id,
          userId: data.userId,
          amountCents: data.amountCents ?? data.amount_cents ?? 0,
          currency: data.currency ?? 'BRL',
          status: data.status ?? 'pending',
          issuedAt: data.issuedAt ?? new Date().toISOString(),
          dueAt: data.dueAt,
          hostedInvoiceUrl: data.hostedInvoiceUrl ?? data.hosted_invoice_url,
        } as Invoice;
      });
      setInvoices(results);
    };

    loadInvoices();
  }, [firestore, user?.uid]);

  const handleChangePlan = () => {
    Alert.alert('Fluxo de checkout', 'Chamar backend `/payments/subscribe` com o plano escolhido (placeholder).');
    // TODO: integrar com Stripe Checkout e atualizar `users.plan` após confirmação.
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Meu plano
      </Text>
      <Card style={styles.card}>
        <Card.Title title={`Plano atual: ${user?.plan ?? 'gratuito'}`} subtitle="Gerencie sua assinatura" />
        <Card.Actions>
          <Button mode="contained" onPress={handleChangePlan}>
            Alterar plano
          </Button>
        </Card.Actions>
      </Card>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Histórico de faturas
      </Text>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.invoiceCard}>
            <Card.Title title={`Fatura ${item.id}`} subtitle={`Status: ${item.status}`} />
            <Card.Content>
              <Text>
                Valor:{' '}
                {(item.amountCents / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: item.currency,
                })}
              </Text>
              <Text>Emitida em: {new Date(item.issuedAt).toLocaleDateString()}</Text>
              {item.hostedInvoiceUrl && <Text>Link: {item.hostedInvoiceUrl}</Text>}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text>Nenhuma fatura encontrada.</Text>}
      />
      <Text style={styles.helper}>
        Para integrar Stripe: crie endpoint que retorna sessionId, use `stripe.redirectToCheckout` no web ou link de pagamento.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
  },
  sectionTitle: {
    marginTop: 16,
  },
  invoiceCard: {
    marginBottom: 12,
  },
  helper: {
    marginTop: 16,
    color: '#64748B',
  },
});

export default PaymentsScreen;
