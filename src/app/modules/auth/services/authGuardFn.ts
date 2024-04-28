import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SharedService } from 'src/app/shared.service';

let adminRole = "admin";
let logisticRole = "logistic";

export const authGuardAdmin = async () => {
    const router = inject(Router);
    const angularFireAuth = inject(AngularFireAuth);
    const sharedService = inject(SharedService);

    let userId: string;
    let userRoles: string[] = [];

    angularFireAuth.authState.subscribe((user) => {
        if (user) {
            userId = user.uid;
        }
        sharedService.getUserDetails(userId).then((results) => {
            if (results[0] != undefined) {
                userRoles = results[0].roles;
                console.log(userRoles);

                if (userRoles.includes(adminRole)) {
                    return true;
                }
                else {
                    router.navigate(['/error/404']);
                    return false;
                }
            }
        })
    })
}

export const authGuardAdminLogistic = async () => {
    const router = inject(Router);
    const angularFireAuth = inject(AngularFireAuth);
    const sharedService = inject(SharedService);

    let userId: string;
    let userRoles: string[] = [];

    angularFireAuth.authState.subscribe((user) => {
        if (user) {
            userId = user.uid;
        }
        sharedService.getUserDetails(userId).then((results) => {
            if (results[0] != undefined) {
                userRoles = results[0].roles;
                console.log(userRoles);

                if (userRoles.includes(adminRole) || userRoles.includes(logisticRole)) {
                    return true;
                }
                else {
                    router.navigate(['/error/404']);
                    return false;
                }
            }
        })
    })
}