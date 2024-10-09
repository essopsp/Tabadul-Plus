import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import CustomerList from './components/CustomerList';
import NewCustomerForm from './components/NewCustomerForm';
import TransactionForm from './components/TransactionForm';
import AccountDetails from './components/AccountDetails';
import ExchangeRates from './components/ExchangeRates';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">الصفحة الرئيسية</Link></li>
            <li><Link to="/customers">قائمة العملاء</Link></li>
            <li><Link to="/new-customer">إضافة عميل جديد</Link></li>
            <li><Link to="/transaction">إجراء معاملة</Link></li>
            <li><Link to="/exchange-rates">أسعار الصرف</Link></li>
          </ul>
        </nav>

        <Switch>
          <Route path="/customers" exact component={CustomerList} />
          <Route path="/new-customer" component={NewCustomerForm} />
          <Route path="/transaction" component={TransactionForm} />
          <Route path="/account/:id" component={AccountDetails} />
          <Route path="/exchange-rates" component={ExchangeRates} />
          <Route path="/">
            <h1>مرحبًا بك في نظام TEBADEL PLUS</h1>
            <p>يرجى اختيار إحدى الخيارات من القائمة أعلاه</p>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;