const BASE_URL = "http://localhost:8080/api";

async function getAccounts(){
    const response = await fetch(BASE_URL + "/accounts");

    if (!response.ok){
        console.error("Error fetching accounts: " + response);
        return;
    }

    const data = await response.json();
    return data;
}

async function showAccounts(){
    const accounts = await getAccounts();
    const $bodyAccounts = document.querySelector("#tableAccounts tbody");

    let rowsHTML = '';

    accounts.forEach(function (account) {
        rowsHTML += `<tr class="text-center">
            <td>${account.id}</td>  
            <td>${account.accountHolderName}</td> 
            <td>${account.balance}</td> 
            <td class="">
                <button class="btn btn-primary btn-edit" data-id="${account.id}" data-bs-toggle="modal" data-bs-target="#editAccountModal">Editar</button>
                <button class="btn btn-danger btn-delete" data-id="${account.id}">Borrar</button>
                <button class="btn btn-success btn-deposit" data-id="${account.id}" data-bs-toggle="modal" data-bs-target="#depositAccountModal">Depositar</button>
                <button class="btn btn-success btn-withdraw" data-id="${account.id}" data-bs-toggle="modal" data-bs-target="#withdrawAccountModal">Retirar</button>
            </td>
        </tr>`; 
    });

    $bodyAccounts.innerHTML = rowsHTML;

    // Función para los botones.
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', loadAccountData);
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', deleteAccount);
    });

    document.querySelectorAll('.btn-deposit').forEach(button => {
        button.addEventListener('click', showDepositModal);
    });

    document.querySelectorAll('.btn-withdraw').forEach(button => {
        button.addEventListener('click', showWithdrawModal);
    });
}

async function init() {
    await showAccounts();
}

init();

async function insertAccount(){
    const $form = document.getElementById('formNewAccount');
    const formData = new FormData($form);

    const account = {
        accountHolderName: formData.get('accountHolderName'),
        balance: formData.get('balance')
    };

    try {
        const response = await fetch(BASE_URL + "/accounts", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(account)
        });

        if (response.ok) {
            const modal = document.getElementById('newAccount');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            swal("Éxito", "La cuenta se agregó correctamente", "success");
            await showAccounts();
            $form.reset();
        } else {
            console.error("Error al insertar cuenta: ", response.statusText);
        }
    } catch (error) {
        console.error("Error al realizar solicitud: ", error);
    }
}

document.getElementById('saveAccount').addEventListener('click', insertAccount);

async function loadAccountData(event){
    const accountId = event.target.getAttribute('data-id');
    const account = await getAccountById(accountId);

    const form = document.getElementById('formEditAccount');
    form.elements['accountHolderName'].value = account.accountHolderName;
    form.elements['balance'].value = account.balance;

    form.setAttribute('data-id', accountId);
}

async function getAccountById(id){
    const response = await fetch(BASE_URL + "/accounts/" + id);
    if (!response.ok) {
        console.error('Error al obtener la cuenta: ', response.statusText);
        return;
    }
    const account = await response.json();
    return account;
}

async function updateAccount() {
    const form = document.getElementById('formEditAccount');
    const accountId = form.getAttribute('data-id');
    const formData = new FormData(form);

    const account = {
        accountHolderName: formData.get('accountHolderName'),
        balance: formData.get('balance')
    };

    try {
        const response = await fetch(BASE_URL + "/accounts/" + accountId, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(account)
        });

        if (response.ok) {
            const modal = document.getElementById('editAccountModal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            swal("Éxito", "La cuenta se actualizó correctamente", "success");
            await showAccounts();
        } else {
            console.error('Error al actualizar la cuenta:', response.statusText);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
}

document.getElementById('updateAccount').addEventListener('click', updateAccount);

async function deleteAccount(event) {
    const accountId = event.target.getAttribute('data-id');

    const confirmacion = confirm('¿Estás seguro de que quieres eliminar esta cuenta?');
    if (!confirmacion) {
        return;
    }

    try {
        const response = await fetch(BASE_URL + '/accounts/' + accountId, {
            method: 'DELETE'
        });

        if (response.ok) {
            swal("Éxito", "La cuenta ha sido eliminada correctamente", "success");
            await showAccounts();
        } else {
            console.error('Error al eliminar la cuenta:', response.statusText);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
}

async function showDepositModal(event) {
    const accountId = event.target.getAttribute('data-id');
    const account = await getAccountById(accountId);

    const currentBalanceElement = document.getElementById('currentBalance');
    currentBalanceElement.textContent = `Saldo Actual: ${account.balance}`;

    const form = document.getElementById('formDepositAccount');
    form.setAttribute('data-id', accountId);
}

async function depositAccount() {
    const form = document.getElementById('formDepositAccount');
    const accountId = form.getAttribute('data-id');
    const formData = new FormData(form);
    const depositAmount = parseFloat(formData.get('depositAmount'));

    if (isNaN(depositAmount) || depositAmount <= 0) {
        swal("Error", "Ingrese un monto válido para depositar.", "error");
        return;
    }

    try {
        const account = await getAccountById(accountId);
        account.balance += depositAmount;

        const response = await fetch(BASE_URL + "/accounts/" + accountId, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(account)
        });

        if (response.ok) {
            const modal = document.getElementById('depositAccountModal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            swal("Éxito", "Depósito realizado correctamente", "success");
            await showAccounts();
        } else {
            console.error('Error al realizar el depósito:', response.statusText);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
}

document.getElementById('depositAccount').addEventListener('click', depositAccount);

async function showWithdrawModal(event) {
    const accountId = event.target.getAttribute('data-id');
    const account = await getAccountById(accountId);

    const currentWithdrawBalanceElement = document.getElementById('currentWithdrawBalance');
    currentWithdrawBalanceElement.textContent = `Saldo Actual: ${account.balance}`;

    const form = document.getElementById('formWithdrawAccount');
    form.setAttribute('data-id', accountId);
}

async function withdrawAccount() {
    const form = document.getElementById('formWithdrawAccount');
    const accountId = form.getAttribute('data-id');
    const formData = new FormData(form);
    const withdrawAmount = parseFloat(formData.get('withdrawAmount'));

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        swal("Error", "Ingrese un monto válido para retirar.", "error");
        return;
    }

    try {
        const account = await getAccountById(accountId);
        
        if (account.balance < withdrawAmount) {
            swal("Error", "Saldo insuficiente para realizar el retiro.", "error");
            return;
        }

        account.balance -= withdrawAmount;

        const response = await fetch(BASE_URL + "/accounts/" + accountId, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(account)
        });

        if (response.ok) {
            const modal = document.getElementById('withdrawAccountModal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            swal("Éxito", "Retiro realizado correctamente", "success");
            await showAccounts();
        } else {
            console.error('Error al realizar el retiro:', response.statusText);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
}

document.getElementById('withdrawAccount').addEventListener('click', withdrawAccount);
