<x-mail::message>
# Struk Pembayaran

Halo {{ $transaction->customer->name ?? 'Pelanggan' }},

{{ $customMessage }}

## Detail Transaksi

**Nomor Invoice:** {{ $transaction->invoice }}
**Tanggal:** {{ $transaction->created_at->format('d F Y, H:i') }}
**Kasir:** {{ $transaction->cashier->name }}

---

<x-mail::table>
| Item | Qty | Harga | Subtotal |
| :--- | :---: | ---: | ---: |
@foreach($transaction->details as $detail)
| {{ $detail->product ? $detail->product->title : $detail->service->name }} | {{ $detail->qty }} | {{ number_format($detail->price / $detail->qty, 0, ',', '.') }} | {{ number_format($detail->price, 0, ',', '.') }} |
@endforeach
</x-mail::table>

---

**Subtotal:** Rp {{ number_format($transaction->grand_total - $transaction->discount, 0, ',', '.') }}
@if($transaction->discount > 0)
**Diskon:** Rp {{ number_format($transaction->discount, 0, ',', '.') }}
@endif
**Total:** Rp {{ number_format($transaction->grand_total, 0, ',', '.') }}

@if($transaction->payment_method === 'cash')
**Tunai:** Rp {{ number_format($transaction->cash, 0, ',', '.') }}
**Kembalian:** Rp {{ number_format($transaction->change, 0, ',', '.') }}
@endif

**Metode Pembayaran:** {{ strtoupper($transaction->payment_method) }}
**Status:** {{ $transaction->payment_status === 'paid' ? 'LUNAS' : 'PENDING' }}

<x-mail::button :url="route('transactions.print', $transaction->invoice)" color="success">
Lihat Invoice
</x-mail::button>

Terima kasih atas kepercayaan Anda!

Salam,<br>
{{ config('app.name') }}
</x-mail::message>
