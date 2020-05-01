const PAGE = {
    IOS: {
        WEBVIEW: {
            LOGIN_PAGE_EMAIL_INPUT: '[name=email]',
            LOGIN_PAGE_PASS_INPUT: '[name=pass]',
            LOGIN_PAGE_LOGIN_BUTTON: '[name=login]',
            PERMISSION_PAGE_OK_BUTTON: '._j93'
        }
    },
    ANDROID: {
        WEBVIEW: {
            LOGIN_PAGE_EMAIL_INPUT: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[2]/android.view.View[3]/android.view.View[1]/android.view.View[2]/android.view.View[1]/android.view.View[1]/android.widget.EditText[1]',
            LOGIN_PAGE_PASS_INPUT: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[2]/android.view.View[3]/android.view.View[1]/android.view.View[2]/android.view.View[1]/android.view.View[1]/android.widget.EditText[2]',
            LOGIN_PAGE_LOGIN_BUTTON: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[2]/android.view.View[3]/android.view.View[1]/android.view.View[2]/android.view.View[2]/android.widget.Button[1]',
            PERMISSION_PAGE_OK_BUTTON: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.webkit.WebView[1]/android.webkit.WebView[1]/android.view.View[1]/android.view.View[2]/android.view.View[3]/android.view.View[1]/android.view.View[1]/android.view.View[1]/android.view.View[1]/android.view.View[2]/android.view.View[1]/android.view.View[1]/android.widget.Button[1]'
        },
        NATIVE: {
            LOGIN_PAGE_EMAIL_INPUT: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[2]/android.widget.RelativeLayout[1]/android.widget.EditText[1]',
            LOGIN_PAGE_PASS_INPUT: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[2]/android.widget.RelativeLayout[2]/android.widget.EditText[1]',
            LOGIN_PAGE_LOGIN_BUTTON: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[2]/android.widget.Button[1]',
            LOGIN_PAGE_REMEMBER_BUTTON: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/android.widget.Button[2]',
            LOGIN_PAGE_LOGIN_AS: '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.Button[1]'
        }
    }
};

const FacebookLoginPage = class {
    async logIn(username, password) {
        PAGE.FACEBOOK_CREDENTIALS = {
            USERNAME: username,
            PASSWORD: password
        };

        //wait for browser/app to open
        await driver.sleep(10000);

        if (Framework.PLATFORM === Framework.IOS) {
            await this._loginOnIOS();
        } else if (Framework.PLATFORM === Framework.ANDROID) {
            const contexts = await driver.contexts();
            await driver.context(contexts[0]);

            if (await this._isFacebookLoginWebView()) {
                await this._loginOnAndroidWebview();
            } else if (await this._isFacebookLoginNative()) {
                await this._loginOnAndroidNative();
            }
        }

        await driver.context(Framework.CONTEXT);
    }

    async _loginOnIOS() {
        const contexts = await driver.contexts();
        await driver.context(contexts[contexts.length - 1]);

        if (await this._isFacebookLoginPageIOS()) {
            await driver
                .selectElement(PAGE.IOS.WEBVIEW.LOGIN_PAGE_EMAIL_INPUT)
                .sendKeys(PAGE.FACEBOOK_CREDENTIALS.USERNAME)
                .selectElement(PAGE.IOS.WEBVIEW.LOGIN_PAGE_PASS_INPUT)
                .sendKeys(PAGE.FACEBOOK_CREDENTIALS.PASSWORD)
                .selectElement(PAGE.IOS.WEBVIEW.LOGIN_PAGE_LOGIN_BUTTON)
                .click()
        }

        await driver
            .selectElement(PAGE.IOS.WEBVIEW.PERMISSION_PAGE_OK_BUTTON)
            .click();
    }

    async _isFacebookLoginPageIOS() {
        return await driver.isElement(PAGE.IOS.WEBVIEW.LOGIN_PAGE_EMAIL_INPUT);
    }

    async _isFacebookLoginNative() {
        const isFirstTime = await this._isLoginAndroidNativeFirstTime();
        const isNextTime = await this._isLoginAndroidNativeNextTime();

        return !!isFirstTime || !!isNextTime;
    }

    async _isFacebookLoginWebView() {
        const isWebView = await driver.isElement(PAGE.ANDROID.WEBVIEW.LOGIN_PAGE_EMAIL_INPUT, 5000);

        return !!isWebView;
    }

    async _loginOnAndroidWebview() {
        await driver
            .selectElement(PAGE.ANDROID.WEBVIEW.LOGIN_PAGE_EMAIL_INPUT)
            .sendKeys(PAGE.FACEBOOK_CREDENTIALS.USERNAME)
            .selectElement(PAGE.ANDROID.WEBVIEW.LOGIN_PAGE_PASS_INPUT)
            .sendKeys(PAGE.FACEBOOK_CREDENTIALS.PASSWORD)
            .selectElement(PAGE.ANDROID.WEBVIEW.LOGIN_PAGE_LOGIN_BUTTON)
            .click()
            .sleep(5000)
            .selectElement(PAGE.ANDROID.WEBVIEW.PERMISSION_PAGE_OK_BUTTON)
            .click()
            .sleep(10000);
    }

    async _loginOnAndroidNative() {
        if (await this._isLoginAndroidNativeFirstTime()) {
            await this._loginAndroidNativeFirstTime();
            await this._androidFirstTimeLoginRememberMe();

            // this part is needed because only second time facebook login works >>>
            // await driver.context(Framework.CONTEXT);
            // await Framework.LoginPage.isPage();
            // await Framework.LoginPage.loginAsFacebook();
            // await driver.sleep(10000);
            // const contexts = await driver.contexts();
            // await driver.context(contexts[0]);
            // await this._loginOnAndroidNative();
            // <<< second time login

        } else if (await this._isLoginAndroidNativeNextTime()) {
            await this._loginAndroidNativeNextTime();
        }

        // if continue as logged in user, check if - tap to login (if pass not remembered)
        //android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.ScrollView[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[1]
        //username
        //android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.RelativeLayout[1]/android.widget.EditText[1]
        //login button
        //android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.Button[1]
    }

    async _isLoginAndroidNativeFirstTime() {
        return await driver.isElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_EMAIL_INPUT);
    }

    async _loginAndroidNativeFirstTime() {
        await driver
            .selectElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_EMAIL_INPUT)
            .sendKeys(PAGE.FACEBOOK_CREDENTIALS.USERNAME)
            .hideKeyboard();
        //this try/catch hide keyboard is needed for hiding hints
        try {
            await driver.hideKeyboard();
        } catch(ignore) {}

        await driver
            .selectElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_PASS_INPUT)
            .sendKeys(PAGE.FACEBOOK_CREDENTIALS.PASSWORD)
            .hideKeyboard();
        //this try/catch hide keyboard is needed for hiding hints
        try {
            await driver.hideKeyboard();
        } catch(ignore) {}

        await driver
            .selectElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_LOGIN_BUTTON)
            .click();

        await driver.sleep(5000);
    }

    async _androidFirstTimeLoginRememberMe() {
        const isRememberMe = await driver.isElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_REMEMBER_BUTTON);

        if (isRememberMe) {
            await driver
                .elementsByXPath(PAGE.ANDROID.NATIVE.LOGIN_PAGE_REMEMBER_BUTTON)
                .click();
        }
    }

    async _isLoginAndroidNativeNextTime() {
        return await driver.isElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_LOGIN_AS);
    }

    async _loginAndroidNativeNextTime() {
        await driver
            .selectElement(PAGE.ANDROID.NATIVE.LOGIN_PAGE_LOGIN_AS)
            .click();
    }
};

export default new FacebookLoginPage();