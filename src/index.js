var createError = require('http-errors');
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const database = require('./config/database');
const EmployeeRouter = require('./routers/EmployeesRouter')
const CustomerRouter = require('./routers/CustomersRouter')
const TransactionsRouter = require('./routers/TransactionsRouter')
const ProductRouter = require('./routers/ProductsRouter')
const port = 8080;
database.connect();
//  config
app.set('view engine', 'hbs');
app.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'mainhome',
    helpers: {
        formatCurrency: function (value) {
            return value.toLocaleString('en-US');
        },
        eq: function (value1, value2, options){
            if(value1 === value2){
                return options.fn(this)
            }else{
                return options.inverse(this)
            }
        },
        formatDate(date) {
            const options = {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            };
            return new Date(date).toLocaleDateString("en-US", options);
        },
        subtract(a,b){
            return a - b;
        }
    },
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser('ddn'));
app.use(session({
    cookie: { maxAge: 300000000 },
    saveUninitialized: true,
    secret: 'abc123a',
    resave: true,
}));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
// config end
app.use('/employees', EmployeeRouter)
app.use('/customers', CustomerRouter)
app.use('/transactions', TransactionsRouter)
app.use('/products', ProductRouter)

app.get('/', (req, res) => {
    if (req.session.account) {
        return res.redirect('/employees/');
    } else {
        return res.redirect('/employees/login');
    }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error', { layout: 'main' });
});

// localhost
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`)
})