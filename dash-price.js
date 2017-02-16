var dashInt;

function setTitle() {
    var curr = options.currency.get();
    var price = DashPrice.getPrice(curr);
    chrome.browserAction.setTitle({
        'title': '1 Dash = ' + price + " " + curr
    });
};
function setBadgeColor(color) {
    var HexaColor = "#0588c7";
    switch (color) {
        case "blue":
            HexaColor = "#0588c7";
            break;
        case "red":
            HexaColor = "#cc3c3c";
            break;
        case "green":
            HexaColor = "#05c712";
            break;
        case "black":
            HexaColor = "#000000";
            break;
    }
    chrome.browserAction.setBadgeBackgroundColor({
        color: HexaColor
    });
}
function setBadge() {
    var curName = options.currency.get();
    var p = options.precision.get();
    var d = options.divider.get();

    var price = DashPrice.getPrice(curName);
    price = price / d;
    price = price.toFixed(p);
    var text = price;
    chrome.browserAction.setBadgeText({
        'text': text
    });
}
function prepareBadge() {

    setBadgeColor('blue')
    chrome.browserAction.setBadgeText({
        'text': '...'
    });
}
function refreshBadgeAndTitle() {
    DashPrice
        .fetch
        .dashPrice()
        .then(function () {
            var curr = options.currency.get();
            var price = DashPrice.getPrice(curr);
            setPriceInHistory(price);
            setTitle();
            setBadge();
        })
}
function setPriceInHistory(newPrice) {
    var history = store.get('history') || "[]";
    history = JSON.parse(history);
    history.push(newPrice);
    if (history.length > 15) {
        history = history.slice(history.length - 15, history.length);
    }
    store.set('history', JSON.stringify(history));
    setBadgeColor('blue');

    if (store.get('lastMax') === null) {
        store.set('lastMax', newPrice);
    } else {
        if ((options.notificationMax.get() === true) && newPrice > options.lastMax.get()) {
            notify('New maximum Dash price', 'The highest price is now ' + newPrice);
        }
        if (newPrice > options.lastMax.get()) {
            setBadgeColor('green');
            store.set('lastMax', newPrice);

        }
    }
    if (store.get('lastMin') === null) {
        store.set('lastMin', newPrice);
    } else {
        if ((options.notificationMin.get() === true) && newPrice < options.lastMin.get()) {
            notify('New minimum Dash price', 'The lowest price is now ' + newPrice);
        }
        if (newPrice < options.lastMin.get()) {
            setBadgeColor('red');
            store.set('lastMin', newPrice);
        }
    }

    // if (store.get('lastMax') && store.get('notification-max') && value > last_max) {
    // if (store.get('notification-max') && value > last_max) {
    //     store.set('last-max', value);
    //     notify('New maximum BTC price', 'The highest price is now ' + value);
    //     $('#last_max').val(value);
    // }
    // if (store.get('notification-min') && value < last_min) {
    //     store.set('last-min', value);
    //     notify('New minimum BTC price', 'The lowest price is now ' + value);
    //     $('#last_min').val(value);
    // }
}
function launchInterval() {
    var period = options.refresh.get();
    period = period * 1000;
    dashInt = setInterval(function () {
        refreshBadgeAndTitle();
    }, period);
}
var AJAX = {
    get: function (url) {
        return new Promise(function (resolve, reject) {
            const req = new XMLHttpRequest();
            req.open('GET', url);
            req.onload = function () {
                req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))
            };
            req.onerror = function (e) {
                reject(Error(`Network Error: ${e}`))
            }

            req.send();
        });
    }
}
var DashPrice = {
    //in USD
    currencyExchangesRates: {},
    currentBitcoinRate: {},
    currentDashRate: {},
    priceHistory: [
        {datetime: 1002, price: 0.15},
        {datetime: 1000, price: 0.10},
        {datetime: 1002, price: 0.11},
        {datetime: 1003, price: 0.12}
    ],
    getPrice: function (currency) {
        var value = JSON.parse(store.get('currentDashRate'))[currency];
        return value;
    },
    getRefreshInterval: function () {
        return 30 * 1000;
    },
    getPriceHistory: function () {
        return this.priceHistory;
    },
    fetch: {
        dashPrice: function () {
            return AJAX
                .get("https://api.coinmarketcap.com/v1/ticker/dash/")
                .then(function (data) {
                    if (data) {
                        data = JSON.parse(data);
                        if (Array.isArray(data))
                            data = data[0];

                        var DashInUSD = data.price_usd;
                        var DashInBTC = data.price_btc;
                        DashPrice.currentDashRate['BTC'] = parseFloat(DashInBTC);
                        var currencyExchange = JSON.parse(store.get('currencyExchangesRates'));

                        for (var cur in currencyExchange) {
                            DashPrice.currentDashRate[cur] = parseFloat(currencyExchange[cur]) * (DashInUSD);
                        }
                        store.set('currentDashRate', JSON.stringify(DashPrice.currentDashRate));

                    }
                })
                .catch(function (err) {
                    console.error(err);
                });
        },
        bitcoinPrice: function () {
            return AJAX
                .get("https://api.coinmarketcap.com/v1/ticker/bitcoin/")
                .then(function (data) {
                    if (data) {
                        data = JSON.parse(data);
                        if (Array.isArray(data))
                            data = data[0];

                        var btcInUSD = data.price_usd;
                        for (var cur in DashPrice.currencyExchangesRates) {
                            DashPrice.currentBitcoinRate[cur] = parseFloat(DashPrice.currencyExchangesRates[cur]) * (btcInUSD);
                        }
                        store.set('currentBitcoinRate', JSON.stringify(DashPrice.currentBitcoinRate));

                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
        },
        currencyList: function () {
            return AJAX
                .get('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml')
                .then(function (data) {
                    var parser = new DOMParser();
                    var xml = parser.parseFromString(data, "text/xml");
                    var xmlList = xml.getElementsByTagName('Cube');

                    //First we get the USD pricing (we are from EURO)
                    if (xml.getElementsByTagName('Cube')[2].attributes['currency'].value == "USD") {
                        var valueUSDEUR = xml.getElementsByTagName('Cube')[2].attributes['rate'].value;
                        var valueEURUSD = 1 / valueUSDEUR;
                        DashPrice.currencyExchangesRates['USD'] = 1;
                        DashPrice.currencyExchangesRates['EUR'] = valueEURUSD;
                        for (var i = 3; i < xmlList.length; i++) {
                            var el = (xml.getElementsByTagName('Cube')[i]);
                            var cur = el.attributes['currency'].value;
                            var rat = el.attributes['rate'].value;
                            DashPrice.currencyExchangesRates[cur] = rat * valueEURUSD;
                        }
                        store.set('currencyExchangesRates', JSON.stringify(DashPrice.currencyExchangesRates));

                        return DashPrice.currencyExchangesRates;
                    }
                });
        }
    }
}


var options = {
    precision: {
        set: function () {
            var e = document.getElementById("precision");
            store.set("precision", parseInt(e.options[e.selectedIndex].value));
        },
        get: function () {
            var p = store.get('precision');
            if (p === null) {
                return 1;
            }
            p = parseInt(p);
            return p;
        }
    },
    divider: {
        set: function () {
            var e = document.getElementById("divider");
            store.set("divider", parseFloat(e.options[e.selectedIndex].value));
        },
        get: function () {
            var d = store.get('divider');
            if (d === null) {
                return 1;
            }
            d = parseFloat(d);
            return d;
        }
    },
    currency: {
        set: function () {
            var e = document.getElementById("currency");
            store.set("currency", e.options[e.selectedIndex].value);
        },
        get: function () {
            var c = store.get('currency');
            if (c === null) {
                return 'USD';
            }
            c = c.toString();
            return c;
        }
    },
    refresh: {
        set: function () {
            var e = document.getElementById("refresh");
            store.set("refresh", parseInt(e.options[e.selectedIndex].value));
        },
        get: function () {
            var r = store.get('refresh');
            if (r === null) {
                return 60;
            }
            r = parseInt(r);
            return r;
        }
    },
    notificationMax: {
        set: function () {
            var e = document.getElementById('notificationMax');
            store.set('notificationMax', e.checked);
        },
        get: function () {
            var n = JSON.parse(store.get('notificationMax'));
            if (n === null) {
                return false;
            }
            return n;
        }
    },
    notificationMin: {
        set: function () {
            var e = document.getElementById('notificationMin');
            store.set('notificationMin', e.checked);
        },
        get: function () {
            var n = JSON.parse(store.get('notificationMin'));
            if (n === null) {
                return false;
            }
            return n;
        }
    },
    lastMax: {
        set: function () {
            var e = document.getElementById('lastMax');
            store.set('lastMax', e.value);
        },
        get: function () {
            var l = JSON.parse(store.get('lastMax'));
            if (l === 0) {
                return 0;
            }
            return l;
        }
    },
    lastMin: {
        set: function () {
            var e = document.getElementById('lastMin');
            store.set('lastMin', e.value);
        },
        get: function () {
            var l = JSON.parse(store.get('lastMin'));
            if (l === 0) {
                return 0;
            }
            return l;
        }
    }
};

var store = {
    set: function (key, val) {
        localStorage.setItem(key, val);
    },
    get: function (key) {
        return localStorage.getItem(key);

    }
}
notify = function (title, msg) {
    var date = new Date(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear();
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }
    var date_str = hour + ':' + minute + ' ' + day + '.' + month + '.' + year;
    return chrome.notifications.create('', {
        type: "basic",
        title: title,
        message: msg,
        contextMessage: date_str,
        iconUrl: "icon.png"
    }, function (notifid) {
    });
};