<?php

use App\Mcp\Servers\TecnoFixServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::local('tecnofix', TecnoFixServer::class);
