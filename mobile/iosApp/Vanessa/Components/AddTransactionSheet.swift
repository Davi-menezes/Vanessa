import Foundation
import SwiftUI
import VanessaShared
import shared

struct AddTransactionData {
    let value: Double
    let category: TransactionCategory
    let type: TransactionType
    let paymentMethod: PaymentMethod
    let description: String
    let exclude: Bool
}

struct AddTransactionSheet: View {
    let onDismiss: () -> Void
    let onConfirm: (AddTransactionData) -> Void

    @State private var value = ""
    @State private var description = ""
    @State private var category: TransactionCategory = .outros
    @State private var type: TransactionType = .saida
    @State private var method: PaymentMethod = .contaCorrente
    @State private var exclude = false

    var body: some View {
        NavigationView {
            Form {
                Section("Valor e descrição") {
                    TextField("Valor", text: $value).keyboardType(.decimalPad)
                    TextField("Descrição", text: $description)
                }
                Section("Categoria") {
                    Picker("Categoria", selection: $category) {
                        ForEach(allCategories, id: \.self) { Text($0.label) }
                    }
                }
                Section("Tipo") {
                    Picker("Tipo", selection: $type) {
                        Text("Despesa").tag(TransactionType.saida)
                        Text("Receita").tag(TransactionType.entrada)
                    }
                }
                Section("Forma") {
                    Picker("Forma", selection: $method) {
                        Text("Conta corrente").tag(PaymentMethod.contaCorrente)
                        Text("Crédito").tag(PaymentMethod.credito)
                    }
                }
                Section("Excluir dos conselhos") {
                    Toggle(isOn: $exclude) { Text("Não incluir em conselhos") }
                }
            }
            .navigationTitle("Nova transação")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { onDismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") {
                        let v = Double(value.replacingOccurrences(of: ",", with: ".")) ?? 0
                        onConfirm(AddTransactionData(
                            value: v, category: category, type: type,
                            paymentMethod: method, description: description,
                            exclude: exclude
                        ))
                    }
                }
            }
        }
    }
}

let allCategories: [TransactionCategory] = [
    .alimentacao, .transporte, .combustivel, .lazer, .saude,
    .educacao, .moradia, .vestuario, .outros
]
